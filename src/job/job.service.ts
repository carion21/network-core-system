import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNodesDto } from './dto/create-nodes.dto';
import { DeleteNodesDto } from './dto/delete-nodes.dto';
import { ReconnectNodesDto } from './dto/reconnect-nodes.dto';
import { UpdateNodesDto } from './dto/update-nodes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodeService } from 'src/node/node.service';
import { IndividualService } from 'src/individual/individual.service';
import { translate } from 'utilities/functions';

@Injectable()
export class JobService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly nodeService: NodeService,
    private readonly individualService: IndividualService,
  ) {}

  async createNodes(createNodesDto: CreateNodesDto, userAuthenticated: object) {
    const { nodes } = createNodesDto;

    let datas = [];

    for (const nd of nodes) {
      let requestCreationNode = await this.nodeService.create({
        nodeTypeId: nd.nodeTypeId,
        label: nd.label,
        description: nd.description,
        nodeParentId: nd.nodeParentId,
      });

      let requestCreationIndividual = await this.individualService.create(
        {
          nodeId: requestCreationNode.data.id,
          data: nd.data,
        },
        userAuthenticated,
        false,
      );

      datas.push({
        node: requestCreationNode.data,
        individual: requestCreationIndividual.data,
      });
    }

    // return the response
    return {
      message: translate('Nodes created successfully'),
      data: datas,
    };
  }

  async updateNodes(updateNodesDto: UpdateNodesDto, userAuthenticated: any) {
    const { nodes } = updateNodesDto;

    let datas = [];

    for (const nd of nodes) {
      let node = await this.prismaService.node.findUnique({
        where: {
          id: nd.nodeId,
          status: true,
        },
        include: {
          Individual: {
            where: {
              status: true,
            },
          },
        },
      });
      if (!node) throw new NotFoundException(translate('Node not found'));

      let requestUpdateIndividual = await this.individualService.update(
        node.Individual[0].id,
        {
          nodeId: nd.nodeId,
          data: nd.data,
        },
        userAuthenticated,
      );

      datas.push(requestUpdateIndividual.data);
    }

    // return the response
    return {
      message: translate('Nodes updated successfully'),
      data: datas,
    };
  }

  async reconnectNodes(reconnectNodesDto: ReconnectNodesDto) {
    const { nodes } = reconnectNodesDto;

    const datas = [];

    for (const nd of nodes) {
      let requestReconnectNode = await this.nodeService.reconnect(
        nd.nodeChildId,
        {
          nodeParentId: nd.nodeParentId,
        },
      );

      datas.push(requestReconnectNode.data);
    }

    // return the response
    return {
      message: translate('Nodes reconnected successfully'),
      data: datas,
    };
  }

  async deleteNodes(deleteNodesDto: DeleteNodesDto) {
    const { nodeIds } = deleteNodesDto;

    for (const nodeId of nodeIds) {
      await this.nodeService.remove(nodeId);
    }

    return {
      message: translate('Nodes deleted successfully'),
    };
  }
}
