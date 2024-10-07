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

@Injectable()
export class DataFieldService {
  constructor(private readonly prismaService: PrismaService) {}

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
      where: { nodeTypeId, slug },
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

    const dataField = await this.prismaService.dataField.create({
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
        slug,
      },
    });
    if (!dataField)
      throw new InternalServerErrorException(
        translate('Data field not created'),
      );

    // return the response
    return {
      message: translate('Data field created successfully'),
      data: dataField,
    };
  }

  async findAll() {
    const dataFields = await this.prismaService.dataField.findMany({
      where: { isDeleted: false },
      include: {
        nodeType: true,
        dataFieldType: true,
      },
    });
    // return the response
    return {
      message: translate('List of data fields'),
      data: dataFields,
    };
  }

  findOne(id: number) {
    const dataField = this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        nodeType: true,
        dataFieldType: true,
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
    } = updateDataFieldDto;
    const dataField = await this.prismaService.dataField.findUnique({
      where: {
        id: id,
        isDeleted: false,
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
      },
    });
    if (exists && exists.id !== id)
      throw new ConflictException(
        translate('Slug already exists for this node type'),
      );
    const updatedDataField = await this.prismaService.dataField.update({
      where: { id },
      data: {
        dataFieldTypeId,
        label,
        description,
        optionnal,
        defaultValue,
        exampleValue,
        slug,
      },
    });
    // return the response
    return {
      message: translate('Data field updated successfully'),
      data: updatedDataField,
    };
  }

  async changeStatus(id: number) {
    const dataField = await this.prismaService.dataField.findUnique({
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
    return {
      message: translate('Data field status updated successfully'),
      data: updatedDataField,
    };
  }

  async remove(id: number) {
    const dataField = await this.prismaService.dataField.findUnique({
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
      data: { isDeleted: true },
    });

    // return the response
    return {
      message: translate('Data field deleted successfully'),
      data: updatedDataField,
    };
  }
}
