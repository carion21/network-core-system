import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateIndividualDto } from './dto/create-individual.dto';
import { UpdateIndividualDto } from './dto/update-individual.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  control_data,
  genIndividualCode,
  translate,
} from 'utilities/functions';
import { Consts } from 'utilities/constants';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class IndividualService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createIndividualDto: CreateIndividualDto,
    userAuthenticated: object,
    isAnSubstitute: boolean,
  ) {
    const { nodeId, data } = createIndividualDto;
    // check if the node exists
    const node = await this.prismaService.node.findUnique({
      where: { id: nodeId },
      include: {
        Individual: {
          where: { status: true },
        },
        nodeType: {
          select: {
            id: true,
            label: true,
            value: true,
            DataField: {
              select: {
                id: true,
                label: true,
                slug: true,
                optionnal: true,
                fillingType: true,
                dataFieldType: {
                  select: {
                    id: true,
                    label: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!node) throw new NotFoundException(translate('Node does not exist'));
    const individualCount = node.Individual.length;

    if (individualCount !== 0 && !isAnSubstitute)
      throw new ConflictException(translate('Node already has an individual'));

    let dataFields = node.nodeType.DataField;
    dataFields = dataFields.filter((field) =>
      Consts.MAP_ROLE_FILLING_TYPES[userAuthenticated['role']].includes(
        field.fillingType,
      ),
    );

    let mapFieldTypes = {};
    dataFields.forEach((field) => {
      let k = field.slug;
      let v = field.dataFieldType.value;
      mapFieldTypes[k] = v;
    });
    const allFields = dataFields.map((field) => field.slug);
    const requiredFields = dataFields
      .filter((field) => !field.optionnal)
      .map((field) => field.slug);

    let inputs = {
      data: data,
      mapFieldTypes: mapFieldTypes,
      allFields: allFields,
      requiredFields: requiredFields,
    };
    const bcontrol = control_data(inputs);
    if (!bcontrol.success)
      throw new BadRequestException(translate(bcontrol.message));

    // update the status of the previous individual
    if (individualCount !== 0 && isAnSubstitute) {
      const updatedIndividual = await this.prismaService.individual.update({
        where: { id: node.Individual[0].id },
        data: { status: false, replacedAt: new Date() },
      });
      if (!updatedIndividual)
        throw new InternalServerErrorException(
          translate('Error while updating individual status'),
        );
    }

    // create the individual
    const individual = await this.prismaService.individual.create({
      data: {
        code: genIndividualCode(),
        nodeId: nodeId,
      },
    });
    if (!individual)
      throw new InternalServerErrorException(
        translate('Errow while creating individual'),
      );

    // create data rows
    const dataRows = await Promise.all(
      dataFields.map(async (field) => {
        return await this.prismaService.dataRow.create({
          data: {
            individualId: individual.id,
            dataFieldId: field.id,
            value: data[field.slug].toString(),
            sysUserId: userAuthenticated['id'],
          },
        });
      }),
    );

    // return the response
    return {
      message: translate('Individual created successfully'),
      data: data,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const individuals = await this.prismaService.individual.findMany({
      where: { isDeleted: false },
      include: {
        node: {
          select: {
            id: true,
            label: true,
            value: true,
            nodeType: {
              select: {
                id: true,
                label: true,
                value: true,
                DataField: {
                  select: {
                    id: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        DataRow: {
          include: {
            dataField: {
              select: {
                id: true,
                label: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    // aasign the data to the individuals
    individuals.forEach((individual) => {
      let data = {};
      individual.DataRow.forEach((row) => {
        data[row.dataField.slug] = row.value;
      });
      // get data field where not exists in data
      const dataFields = individual.node.nodeType.DataField;
      dataFields.forEach((field) => {
        if (!data[field.slug]) {
          data[field.slug] = null;
        }
      });
      individual['data'] = data;
      delete individual.node.nodeType.DataField;
      delete individual.DataRow;
    });
    // return the response
    return {
      message: translate('Individuals found successfully'),
      data: individuals,
    };
  }

  async findOne(id: number) {
    const individual = await this.prismaService.individual.findUnique({
      where: { id: id, isDeleted: false },
      include: {
        node: {
          select: {
            id: true,
            label: true,
            value: true,
            nodeType: {
              select: {
                id: true,
                label: true,
                value: true,
                DataField: {
                  select: {
                    id: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        DataRow: {
          include: {
            dataField: {
              select: {
                id: true,
                label: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!individual)
      throw new NotFoundException(translate('Individual not found'));
    // assign the data to the individual
    let data = {};
    individual.DataRow.forEach((row) => {
      data[row.dataField.slug] = row.value;
    });
    // get data field where not exists in data
    const dataFields = individual.node.nodeType.DataField;
    dataFields.forEach((field) => {
      if (!data[field.slug]) {
        data[field.slug] = null;
      }
    });
    individual['data'] = data;
    delete individual.node.nodeType.DataField;
    delete individual.DataRow;
    // return the response
    return {
      message: translate('Individual found successfully'),
      data: individual,
    };
  }

  async update(
    id: number,
    updateIndividualDto: UpdateIndividualDto,
    userAuthenticated: object,
  ) {
    const { data } = updateIndividualDto;
    // check if the individual exists
    const individual = await this.prismaService.individual.findUnique({
      where: { id: id, isDeleted: false },
      include: {
        node: {
          select: {
            id: true,
            label: true,
            value: true,
            nodeType: {
              select: {
                id: true,
                label: true,
                value: true,
                DataField: {
                  select: {
                    id: true,
                    slug: true,
                    optionnal: true,
                    fillingType: true,
                    dataFieldType: {
                      select: {
                        id: true,
                        label: true,
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        DataRow: {
          include: {
            dataField: {
              select: {
                id: true,
                label: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!individual)
      throw new NotFoundException(translate('Individual not found'));
    // get the node
    const node = individual.node;

    let dataFields = node.nodeType.DataField;
    dataFields = dataFields.filter((field) =>
      Consts.MAP_ROLE_FILLING_TYPES[userAuthenticated['role']].includes(
        field.fillingType,
      ),
    );

    let mapFieldTypes = {};
    dataFields.forEach((field) => {
      let k = field.slug;
      let v = field.dataFieldType.value;
      mapFieldTypes[k] = v;
    });
    const allFields = dataFields.map((field) => field.slug);
    const requiredFields = dataFields
      .filter((field) => !field.optionnal)
      .map((field) => field.slug);

    let inputs = {
      data: data,
      mapFieldTypes: mapFieldTypes,
      allFields: allFields,
      requiredFields: requiredFields,
    };
    const bcontrol = control_data(inputs);
    if (!bcontrol.success)
      throw new BadRequestException(translate(bcontrol.message));

    // update the data rows
    const dataRows = await Promise.all(
      dataFields.map(async (field) => {
        const dataRow = individual.DataRow.find(
          (row) => row.dataField.slug === field.slug,
        );
        if (!dataRow && !data[field.slug]) {
          console.log('dataRow not found with slug', field.slug);
          return;
        }

        if (!dataRow && data[field.slug]) {
          const newDataRow = await this.prismaService.dataRow.create({
            data: {
              individualId: individual.id,
              dataFieldId: field.id,
              value: data[field.slug],
            },
          });
          if (!newDataRow)
            throw new InternalServerErrorException(
              translate('Error while creating data row'),
            );
          return;
        }

        if (dataRow.value === data[field.slug]) return;

        const updatedDataRow = await this.prismaService.dataRow.update({
          where: { id: dataRow.id },
          data: { value: data[field.slug] },
        });
        if (!updatedDataRow)
          throw new InternalServerErrorException(
            translate('Error while updating data row'),
          );
      }),
    );

    // get the updated individual
    const updatedIndividual = await this.prismaService.individual.findUnique({
      where: { id: id },
      include: {
        node: {
          select: {
            id: true,
            label: true,
            value: true,
            nodeType: {
              select: {
                id: true,
                label: true,
                value: true,
                DataField: {
                  select: {
                    id: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        DataRow: {
          include: {
            dataField: {
              select: {
                id: true,
                label: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    if (!updatedIndividual)
      throw new NotFoundException(translate('Individual updated not found'));
    // assign the data to the individual
    let xdata = {};
    updatedIndividual.DataRow.forEach((row) => {
      xdata[row.dataField.slug] = row.value;
    });
    // get data field where not exists in data
    dataFields.forEach((field) => {
      if (!xdata[field.slug]) {
        xdata[field.slug] = null;
      }
    });
    updatedIndividual['data'] = xdata;
    delete updatedIndividual.node.nodeType.DataField;
    delete updatedIndividual.DataRow;

    // return the response
    return {
      message: translate('Individual updated successfully'),
      data: updatedIndividual,
    };
  }

  async changeStatus(id: number) {
    const individual = await this.prismaService.individual.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!individual)
      throw new NotFoundException(translate('Individual not found'));
    const updatedIndividual = await this.prismaService.individual.update({
      where: { id: id },
      data: { status: !individual.status },
    });
    if (!updatedIndividual)
      throw new InternalServerErrorException(
        translate('Error while changing individual status'),
      );
    return {
      message: translate('Individual status changed successfully'),
      data: updatedIndividual,
    };
  }

  async remove(id: number) {
    const individual = await this.prismaService.individual.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!individual)
      throw new NotFoundException(translate('Individual not found'));

    const updatedIndividual = await this.prismaService.individual.update({
      where: { id: id },
      data: { isDeleted: true },
    });
    if (!updatedIndividual)
      throw new InternalServerErrorException(
        translate('Error while deleting individual'),
      );

    return {
      message: translate('Individual deleted successfully'),
      data: updatedIndividual,
    };
  }
}
