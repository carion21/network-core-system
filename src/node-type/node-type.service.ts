import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  generateWorksheetBuffer,
  genNodeTypeCode,
  getSlug,
  translate,
} from 'utilities/functions';
import { Response } from 'express';
import { Consts } from 'utilities/constants';

@Injectable()
export class NodeTypeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createNodeTypeDto: CreateNodeTypeDto) {
    const { distributionChannelId, label, description, nodeTypeParentId } =
      createNodeTypeDto;
    // check if the distribution channel exists
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id: distributionChannelId },
      });
    if (!distributionChannel)
      throw new NotFoundException(
        translate('Distribution channel does not exist'),
      );
    // check if the node type parent exists
    if (nodeTypeParentId) {
      const nodeTypeParent = await this.prismaService.nodeType.findUnique({
        where: { id: nodeTypeParentId },
      });
      if (!nodeTypeParent)
        throw new NotFoundException(
          translate('Node type parent does not exist'),
        );
    }
    // check if the slug already exists
    const value = getSlug(label);
    const exists = await this.prismaService.nodeType.findFirst({
      where: { value },
    });
    if (exists) throw new ConflictException(translate('Slug already exists'));
    // create the node type
    const nodeType = await this.prismaService.nodeType.create({
      data: {
        code: genNodeTypeCode(),
        distributionChannelId,
        label,
        value,
        description,
        nodeTypeParentId,
      },
    });
    if (!nodeType)
      throw new InternalServerErrorException(
        translate('Node type could not be created'),
      );
    // return the response
    return {
      message: translate('Node type created successfully'),
      data: nodeType,
    };
  }

  async findAll() {
    const nodeTypes = await this.prismaService.nodeType.findMany({
      where: { isDeleted: false },
      include: {
        distributionChannel: true,
        DataField: {
          select: {
            label: true,
            slug: true,
            optionnal: true,
            fillingType: true,
            dataFieldType: {
              select: {
                label: true,
                value: true,
              },
            },
          },
        },
        Node: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    // return the response
    return {
      message: translate('Node types retrieved successfully'),
      data: nodeTypes,
    };
  }

  async generateModelExcel(id: number, res: Response) {
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id },
      include: {
        DataField: {
          select: {
            label: true,
            slug: true,
            optionnal: true,
            fillingType: true,
            dataFieldType: {
              select: {
                label: true,
                value: true,
              },
            },
          },
        },
      },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));

    // filter on the data fields
    nodeType.DataField = nodeType.DataField.filter((dataField) =>
      Consts.MAP_ROLE_FILLING_TYPES[Consts.DEFAULT_ROLE_WEB].includes(
        dataField.fillingType,
      ),
    );

    // generate the excel file
    const columns = nodeType.DataField.map((dataField) => dataField.label);
    const buffer = await generateWorksheetBuffer(columns);
    // return the response with the excel file

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${nodeType.label}.xlsx`,
    );
    res.send(buffer);
  }

  async findOne(id: number) {
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: id, isDeleted: false },
      include: {
        distributionChannel: true,
        DataField: {
          select: {
            label: true,
            slug: true,
            optionnal: true,
            fillingType: true,
            dataFieldType: {
              select: {
                label: true,
                value: true,
              },
            },
          },
        },
        Node: true,
      },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));
    // return the response
    return {
      message: translate('Node type retrieved successfully'),
      data: nodeType,
    };
  }

  async update(id: number, updateNodeTypeDto: UpdateNodeTypeDto) {
    const { distributionChannelId, label, description, nodeTypeParentId } =
      updateNodeTypeDto;
    // check if the node type exists
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));
    // check if the distribution channel exists
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id: distributionChannelId },
      });
    if (!distributionChannel)
      throw new NotFoundException(
        translate('Distribution channel does not exist'),
      );
    // check if the node type parent exists
    if (nodeTypeParentId) {
      const nodeTypeParent = await this.prismaService.nodeType.findUnique({
        where: { id: nodeTypeParentId },
      });
      if (!nodeTypeParent)
        throw new NotFoundException(
          translate('Node type parent does not exist'),
        );
      if (nodeTypeParent.id === nodeType.id)
        throw new ForbiddenException(
          translate('Node type cannot be its own parent'),
        );
    }
    // check if the slug already exists
    const value = getSlug(label);
    const exists = await this.prismaService.nodeType.findFirst({
      where: { value },
    });
    if (exists && exists.id !== id)
      throw new ConflictException(translate('Slug already exists'));
    // update the node type
    const updatedNodeType = await this.prismaService.nodeType.update({
      where: { id },
      data: {
        distributionChannelId,
        label,
        value,
        description,
        nodeTypeParentId,
      },
    });
    if (!updatedNodeType)
      throw new InternalServerErrorException(
        translate('Node type could not be updated'),
      );

    // return the response
    return {
      message: translate('Node type updated successfully'),
      data: updatedNodeType,
    };
  }

  async changeStatus(id: number) {
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: id, isDeleted: false },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));
    // update the node type
    const updatedNodeType = await this.prismaService.nodeType.update({
      where: { id },
      data: { status: !nodeType.status },
    });
    if (!updatedNodeType)
      throw new InternalServerErrorException(
        translate('Node type status could not be updated'),
      );

    // return the response
    return {
      message: translate('Node type status updated successfully'),
      data: updatedNodeType,
    };
  }

  async remove(id: number) {
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: id, isDeleted: false },
      include: {
        Node: {
          where: { isDeleted: false },
          select: {
            id: true,
          },
        },
      },
    });
    if (!nodeType)
      throw new NotFoundException(translate('Node type does not exist'));

    // check if the node type has nodes
    if (nodeType.Node.length > 0)
      throw new ForbiddenException(
        translate('Node type cannot be deleted because it has nodes'),
      );

    // update the node type to be deleted
    const updatedNodeType = await this.prismaService.nodeType.update({
      where: { id },
      data: { isDeleted: true },
    });

    // return the response
    return {
      message: translate('Node type deleted successfully'),
      data: updatedNodeType,
    };
  }
}
