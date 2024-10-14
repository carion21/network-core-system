import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDistributionChannelDto } from './dto/create-distribution-channel.dto';
import { UpdateDistributionChannelDto } from './dto/update-distribution-channel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  genDistributionChannelCode,
  getSlug,
  translate,
} from 'utilities/functions';

@Injectable()
export class DistributionChannelService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDistributionChannelDto: CreateDistributionChannelDto) {
    const { entityId, label, description } = createDistributionChannelDto;
    // check if the entity exists
    const entity = await this.prismaService.entity.findUnique({
      where: { id: entityId },
    });
    if (!entity)
      throw new NotFoundException(translate('Entity does not exist'));
    // check if the slug already exists
    const value = getSlug(label);
    const exists = await this.prismaService.distributionChannel.findFirst({
      where: { value },
    });
    if (exists) throw new ConflictException(translate('Slug already exists'));
    const distributionChannel =
      await this.prismaService.distributionChannel.create({
        data: {
          code: genDistributionChannelCode(),
          label,
          description,
          value,
          entityId,
        },
      });
    if (!distributionChannel)
      throw new InternalServerErrorException(
        translate('An error occurred while creating the distribution channel'),
      );
    // return the response
    return {
      message: translate('Distribution channel created successfully'),
      data: distributionChannel,
    };
  }

  async findAll() {
    const distributionChannels =
      await this.prismaService.distributionChannel.findMany({
        include: {
          entity: true,
          NodeType: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    // return the response
    return {
      message: translate('List of distribution channels'),
      data: distributionChannels,
    };
  }

  async generateInterfaceContract(id: number) {
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
        include: {
          NodeType: {
            include: {
              DataField: {
                include: {
                  dataFieldType: true,
                },
              },
            },
          },
        },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    let contracts = {};
    for (const nt of distributionChannel.NodeType) {
      contracts[nt.value] = {
        web: {},
        job: {},
      };
      for (const df of nt.DataField) {
        // contracts[nt.value][df.slug] = df.dataFieldType.value;
        if (df.fillingType === 'mixed' || df.fillingType === 'manual') {
          contracts[nt.value]['web'][df.slug] = df.dataFieldType.value;
        }
        if (df.fillingType === 'mixed' || df.fillingType === 'automatic') {
          contracts[nt.value]['job'][df.slug] = df.dataFieldType.value;
        }
      }
    }

    // return the response
    return {
      message: translate('Interface contract generated successfully'),
      data: contracts,
    };
  }

  async getFirstRow(id: number) {
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
        include: {
          entity: true,
          NodeType: true,
        },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    // get the nodetype of the distribution channel which is the root node
    const nodeTypes = await this.prismaService.nodeType.findMany({
      where: {
        distributionChannelId: id,
        nodeTypeParentId: null,
      },
    });
    if (nodeTypes.length === 0)
      throw new NotFoundException(translate('Node type not found'));

    let nodes = await this.prismaService.node.findMany({
      where: {
        nodeTypeId: {
          in: nodeTypes.map((nt) => nt.id),
        },
      },
      include: {
        nodeType: true,
        Individual: {
          include: {
            DataRow: {
              orderBy: {
                id: 'desc',
              },
            },
          },
          where: {
            status: true,
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    // return the response
    return {
      message: translate('First row retrieved successfully'),
      data: nodes,
    };
  }

  async getTree(id: number) {
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
        include: {
          entity: true,
          NodeType: true,
        },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    // get the nodetype of the distribution channel which is the root node
    const nodeTypes = await this.prismaService.nodeType.findMany({
      where: {
        distributionChannelId: id,
        nodeTypeParentId: null,
      },
    });
    if (nodeTypes.length === 0)
      throw new NotFoundException(translate('Node type not found'));

    let nodes = await this.prismaService.node.findMany({
      where: {
        nodeTypeId: {
          in: nodeTypes.map((nt) => nt.id),
        },
      },
      include: {
        nodeType: true,
        Individual: {
          where: {
            status: true,
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    // build the architecture of the node
    // nodes = nodes.map((node) => {
    //   let parents = [node];
    //   while (parents.length > 0) {
    //     let newParents = [];
    //     for (const parent of parents) {
    //       let children = [];
    //       const nodeConnections =
    //         await this.prismaService.nodeConnection.findMany({
    //           where: {
    //             parentNodeId: parent.id,
    //             isActive: true,
    //           },
    //           select: {
    //             childNodeId: true,
    //           },
    //         });
    //       children = await this.prismaService.node.findMany({
    //         where: { id: { in: nodeConnections.map((nc) => nc.childNodeId) } },
    //         include: {
    //           nodeType: true,
    //           Individual: {
    //             where: {
    //               status: true,
    //             },
    //             orderBy: {
    //               id: 'desc',
    //             },
    //           },
    //         },
    //       });
    //       parent['children'] = children;
    //       if (children.length > 0) newParents = newParents.concat(children);
    //     }
    //     parents = newParents;
    //   }
    //   return node;
    // });

    // return the response
    return {
      message: translate('Node tree retrieved successfully'),
      data: nodes,
    };
  }

  async findOne(id: number) {
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
        include: {
          entity: true,
          NodeType: true,
        },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));
    // return the response
    return {
      message: translate('Distribution channel found'),
      data: distributionChannel,
    };
  }

  async update(
    id: number,
    updateDistributionChannelDto: UpdateDistributionChannelDto,
  ) {
    const { entityId, label, description } = updateDistributionChannelDto;

    // check if the distribution channel exists
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
        include: {
          entity: true,
          NodeType: true,
        },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    // check if the entity exists
    const entity = await this.prismaService.entity.findUnique({
      where: { id: entityId },
    });
    if (!entity)
      throw new NotFoundException(translate('Entity does not exist'));
    const value = getSlug(label);
    // check if the slug already exists
    const exists = await this.prismaService.distributionChannel.findFirst({
      where: { value },
    });
    if (exists && exists.id !== id)
      throw new ConflictException(translate('Slug already exists'));

    const updatedDistributionChannel =
      await this.prismaService.distributionChannel.update({
        where: { id },
        data: {
          label,
          description,
          value,
          // entityId,
        },
      });
    if (!updatedDistributionChannel)
      throw new InternalServerErrorException(
        translate('An error occurred while updating the distribution channel'),
      );

    // return the response
    return {
      message: translate('Distribution channel updated successfully'),
      data: distributionChannel,
    };
  }

  async changeStatus(id: number) {
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));
    const updatedDistributionChannel =
      await this.prismaService.distributionChannel.update({
        where: { id },
        data: { status: !distributionChannel.status },
      });
    if (!updatedDistributionChannel)
      throw new InternalServerErrorException(
        translate('An error occurred while updating the distribution channel'),
      );
    // return the response
    return {
      message: translate('Distribution channel status updated successfully'),
      data: updatedDistributionChannel,
    };
  }
}
