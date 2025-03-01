import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDataFieldDto } from './dto/create-data-field.dto';
import { UpdateDataFieldDto } from './dto/update-data-field.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { genDataFieldCode, getSlug, translate } from 'utilities/functions';
import { Consts } from 'utilities/constants';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SharedService } from 'src/shared/shared.service';
import { CreateManyDataFieldDto } from './dto/create-many-data-field.dto';

@Injectable()
export class DataFieldService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  async create(createDataFieldDto: CreateDataFieldDto) {
    const {
      nodeTypeId,
      dataFieldTypeId,
      label,
      description,
      isPrimaryKey,
      optionnal,
      fillingType,
      defaultValue,
      exampleValue,
      selectValues,
    } = createDataFieldDto;
    // check if the node type exists
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: nodeTypeId },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));

    // check if the data field type exists
    const dataFieldType = await this.prismaService.dataFieldType.findUnique({
      where: { id: dataFieldTypeId },
    });
    if (!dataFieldType)
      throw new NotFoundException(translate('Data field type does not exist'));

    // check if the slug already exists
    const slug = getSlug(label);
    const exists = await this.prismaService.dataField.findFirst({
      where: {
        nodeTypeId,
        slug,
        isDeleted: false,
      },
    });
    if (exists)
      throw new ConflictException(
        translate('Slug already exists for this node type'),
      );

    if (fillingType && !Consts.DEFAULT_FILLING_TYPES.includes(fillingType))
      throw new BadRequestException(translate('Invalid filling type'));

    if (isPrimaryKey) {
      // deactivate all other primary keys
      await this.prismaService.dataField.updateMany({
        where: { nodeTypeId, isPrimaryKey: true },
        data: { isPrimaryKey: false },
      });
    }

    let dataField = await this.prismaService.dataField.create({
      data: {
        code: genDataFieldCode(),
        nodeTypeId,
        dataFieldTypeId,
        label,
        description,
        isPrimaryKey,
        optionnal,
        fillingType,
        defaultValue,
        exampleValue,
        selectValues,
        slug,
      },
    });
    if (!dataField)
      throw new InternalServerErrorException(
        translate('Data field not created'),
      );

    if (dataFieldType.value === 'select') {
      await this.prismaService.selectValue.createMany({
        data: selectValues.split(';').map((value) => ({
          dataFieldId: dataField.id,
          value,
        })),
      });
    }

    // return the response
    dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: dataField.id,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
      },
    });
    return {
      message: translate('Data field created successfully'),
      data: dataField,
    };
  }

  async createMany(createManyDataFieldDto: CreateManyDataFieldDto) {
    const { dataFields } = createManyDataFieldDto;

    // check if the node type exists
    const createdDataFields = [];
    for (const dataField of dataFields) {
      let rDataField = await this.create(dataField);
      createdDataFields.push(rDataField.data);
    }

    // return the response
    return {
      message: translate('Data fields created successfully'),
      data: createdDataFields,
    };
  }

  async findAllByNodeType(nodeTypeId: number, paginationDto: PaginationDto) {
    // retrieve the node type
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: {
        id: nodeTypeId,
        isDeleted: false,
      },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type not found'));

    // retrieve the data fields
    const options = {
      where: {
        nodeTypeId,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
      },
    };
    const dataFields = await this.sharedService.paginate(
      this.prismaService.dataField,
      paginationDto,
      options,
    );

    // return the response
    return {
      message: translate('List of data fields'),
      data: dataFields,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const options = {
      where: { isDeleted: false },
      include: {
        nodeType: true,
        dataFieldType: true,
        SelectValue: true,
      },
    };
    const dataFields = await this.sharedService.paginate(
      this.prismaService.dataField,
      paginationDto,
      options,
    );
    // return the response
    return {
      message: translate('List of data fields'),
      data: dataFields,
    };
  }

  async findOne(id: number) {
    // retrieve the data field
    const dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
        SelectValue: true,
      },
    });

    // return the response
    return {
      message: translate('Data field found successfully'),
      data: dataField,
    };
  }

  async update(id: number, updateDataFieldDto: UpdateDataFieldDto) {
    const {
      dataFieldTypeId,
      label,
      description,
      isPrimaryKey,
      optionnal,
      defaultValue,
      exampleValue,
      selectValues,
    } = updateDataFieldDto;

    // retrieve the data field
    let dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        SelectValue: true,
      },
    });
    if (!dataField)
      throw new NotFoundException(translate('Data field not found'));

    // check if the data field type exists
    const dataFieldType = await this.prismaService.dataFieldType.findUnique({
      where: { id: dataFieldTypeId },
    });
    if (!dataFieldType)
      throw new NotFoundException(translate('Data field type does not exist'));

    // check if the slug already exists
    const slug = getSlug(label);
    const exists = await this.prismaService.dataField.findFirst({
      where: {
        nodeTypeId: dataField.nodeTypeId,
        slug,
        isDeleted: false,
      },
    });
    if (exists && exists.id !== id)
      throw new ConflictException(
        translate('Slug already exists for this node type'),
      );

    if (isPrimaryKey) {
      // deactivate all other primary keys
      await this.prismaService.dataField.updateMany({
        where: {
          nodeTypeId: dataField.nodeTypeId,
          isPrimaryKey: true,
        },
        data: { isPrimaryKey: false },
      });
    }
    const updatedDataField = await this.prismaService.dataField.update({
      where: { id },
      data: {
        dataFieldTypeId,
        label,
        description,
        isPrimaryKey,
        optionnal,
        defaultValue,
        exampleValue,
        slug,
      },
    });

    // update the select values
    if (dataFieldType.value === 'select') {
      // if the select values are empty, delete all the values
      if (!selectValues) {
        await this.prismaService.selectValue.deleteMany({
          where: { dataFieldId: id },
        });
      }
      // if the select values are not empty, update the values
      // create the new values which do not exist
      // delete the values which do not exist in the new
      else {
        const newSelectValues = selectValues.split(';');
        const oldSelectValues = dataField.SelectValue.map(
          (value) => value.value,
        );
        const toDelete = oldSelectValues.filter(
          (value) => !newSelectValues.includes(value),
        );
        const toCreate = newSelectValues.filter(
          (value) => !oldSelectValues.includes(value),
        );
        await this.prismaService.selectValue.deleteMany({
          where: { dataFieldId: id, value: { in: toDelete } },
        });
        await this.prismaService.selectValue.createMany({
          data: toCreate.map((value) => ({
            dataFieldId: id,
            value,
          })),
        });
      }
    }

    // return the response
    dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
        SelectValue: true,
      },
    });
    return {
      message: translate('Data field updated successfully'),
      data: dataField,
    };
  }

  async changeStatus(id: number) {
    // retrieve the data field
    let dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!dataField)
      throw new NotFoundException(translate('Data field not found'));
    const updatedDataField = await this.prismaService.dataField.update({
      where: { id },
      data: {
        status: !dataField.status,
      },
    });

    // return the response
    dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
      },
    });
    return {
      message: translate('Data field status updated successfully'),
      data: dataField,
    };
  }

  async remove(id: number) {
    let dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
    });
    if (!dataField)
      throw new NotFoundException(translate('Data field not found'));

    // update the data field for deletion
    const updatedDataField = await this.prismaService.dataField.update({
      where: { id },
      data: { isDeleted: true, slug: `deleted-${dataField.slug}` },
    });

    // return the response
    return {
      message: translate('Data field deleted successfully'),
      data: updatedDataField,
    };
  }
}
