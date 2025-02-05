import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  formatNodeData,
  genNodeCode,
  getSlug,
  translate,
} from 'utilities/functions';
import { ReconnectNodeDto } from './dto/reconnect-node.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SharedService } from 'src/shared/shared.service';
import { CreateManyNodeDto } from './dto/create-many-node.dto';
import { NodePaginationDto } from 'src/shared/dto/node-pagination.dto';

@Injectable()
export class NodeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedSevice: SharedService,
  ) {}

  async create(createNodeDto: CreateNodeDto) {
    const { nodeTypeId, label, description, nodeParentId } = createNodeDto;

    // Vérifier si le type de noeud existe
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: nodeTypeId },
    });
    if (!nodeType) {
      throw new NotFoundException(translate('Node type does not exist'));
    }

    // Vérifier si le parent du noeud existe (si défini)
    if (nodeParentId) {
      const nodeParent = await this.prismaService.node.findUnique({
        where: { id: nodeParentId },
      });
      if (!nodeParent) {
        throw new NotFoundException(translate('Node parent does not exist'));
      }
      // Si le type de parent est défini, vérifier si le parent est du bon type
      if (
        nodeType.nodeTypeParentId &&
        nodeParent.nodeTypeId !== nodeType.nodeTypeParentId
      )
        throw new ForbiddenException(
          translate('Node parent type is not allowed'),
        );
    }

    // Vérifier si le slug (valeur générée à partir du label) existe déjà
    const value = getSlug(label);
    const existingNode = await this.prismaService.node.findFirst({
      where: { value },
    });
    if (existingNode) {
      throw new ConflictException(translate('Slug already exists'));
    }

    // Créer le noeud
    const node = await this.prismaService.node.create({
      data: {
        code: genNodeCode(), // Génération du code unique pour le noeud
        nodeTypeId,
        label,
        value,
        description,
      },
    });
    if (!node) {
      throw new InternalServerErrorException(
        translate('Node could not be created'),
      );
    }

    // Si un parent est défini, créer une connexion parent-enfant
    if (nodeParentId) {
      const nodeConnection = await this.prismaService.nodeConnection.create({
        data: {
          parentNodeId: nodeParentId,
          childNodeId: node.id,
        },
      });
      if (!nodeConnection) {
        throw new InternalServerErrorException(
          translate('Node connection could not be created'),
        );
      }
    }

    // Retourner la réponse avec un message de succès et les détails du noeud
    return {
      message: translate('Node created successfully'),
      data: node,
    };
  }

  async createMany(createManyNodeDto: CreateManyNodeDto) {
    const { nodes } = createManyNodeDto;

    const createdNodes = [];
    for (const node of nodes) {
      let rNode = await this.create(node);
      createdNodes.push(rNode.data);
    }

    // return the response
    return {
      message: translate('Nodes created successfully'),
      data: createdNodes,
    };
  }

  async getTree(id: number) {
    const node = await this.prismaService.node.findUnique({
      where: { id },
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
    if (!node) throw new NotFoundException(translate('Node not found'));
    // build the architecture of the node
    let parents = [node];
    while (parents.length > 0) {
      let newParents = [];
      for (const parent of parents) {
        let children = [];
        const nodeConnections =
          await this.prismaService.nodeConnection.findMany({
            where: {
              parentNodeId: parent.id,
              isActive: true,
            },
            select: {
              childNodeId: true,
            },
          });
        children = await this.prismaService.node.findMany({
          where: { id: { in: nodeConnections.map((nc) => nc.childNodeId) } },
          include: {
            nodeType: true,
            Individual: {
              where: {
                status: true,
              },
              orderBy: {
                id: 'asc',
              },
            },
          },
        });
        parent['children'] = children;
        if (children.length > 0) newParents = newParents.concat(children);
      }
      parents = newParents;
    }
    // return the response
    return {
      message: translate('Node tree retrieved successfully'),
      data: node,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const options = {
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
      orderBy: {
        id: 'desc',
      },
    };
    const nodes = await this.sharedSevice.paginate(
      this.prismaService.node,
      paginationDto,
      options,
    );
    // return the response
    return {
      message: translate('Nodes retrieved successfully'),
      data: nodes,
    };
  }

  async findOne(id: number) {
    const node = await this.prismaService.node.findUnique({
      where: { id },
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
    if (!node) throw new NotFoundException(translate('Node not found'));

    // build the architecture of the node
    let children = [];
    const nodeConnections = await this.prismaService.nodeConnection.findMany({
      where: {
        parentNodeId: node.id,
        isActive: true,
      },
      select: {
        childNodeId: true,
      },
    });
    if (nodeConnections.length > 0)
      children = await this.prismaService.node.findMany({
        where: { id: { in: nodeConnections.map((nc) => nc.childNodeId) } },
      });
    node['children'] = children;

    // return the response
    return {
      message: translate('Node retrieved successfully'),
      data: node,
    };
  }

  async firstChildren(
    distributionChannelId: number,
    nodePaginationDto: NodePaginationDto,
  ) {
    // check if the distribution channel exists
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id: distributionChannelId },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    // get the node types which are not parents
    const nodeTypes = await this.prismaService.nodeType.findMany({
      where: {
        nodeTypeParentId: 0,
        distributionChannelId,
      },
    });

    // get the nodes of the node types
    const nodeTypeIds = nodeTypes.map((nt) => nt.id);
    // get the nodes of the node types
    const options = {
      where: {
        nodeTypeId: { in: nodeTypeIds },
        isDeleted: false,
      },
      select: {
        id: true,
        code: true,
        label: true,
        status: true,
        nodeType: {
          select: {
            id: true,
            label: true,
          },
        },
        Individual: {
          where: {
            status: true,
          },
          select: {
            id: true,
            code: true,
            status: true,
            DataRow: {
              select: {
                id: true,
                value: true,
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
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    };

    const nodes = await this.sharedSevice.paginate(
      this.prismaService.node,
      nodePaginationDto as PaginationDto,
      options,
    );

    // prepare the response
    let data = [];
    data = nodes.data.map((n) => formatNodeData(n));

    // return the response
    return {
      message: translate('First children retrieved successfully'),
      data: {
        data: data,
        meta: nodes.meta,
      },
    };
  }

  async showChildren(id: number, nodePaginationDto: NodePaginationDto) {
    const node = await this.prismaService.node.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        label: true,
        status: true,
        nodeType: {
          select: {
            id: true,
            label: true,
            DataField: {
              select: {
                id: true,
                label: true,
                slug: true,
              },
            },
          },
        },
        Individual: {
          where: {
            status: true,
          },
          select: {
            id: true,
            code: true,
            status: true,
            DataRow: {
              select: {
                id: true,
                value: true,
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
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    });
    if (!node) throw new NotFoundException(translate('Node not found'));

    const options = {
      where: {
        parentNodeId: id,
        isActive: true,
      },
      select: {
        childNodeId: true,
      },
    };

    const nodeConnections = await this.sharedSevice.paginate(
      this.prismaService.nodeConnection,
      nodePaginationDto as PaginationDto,
      options,
    );

    const nodes = await this.prismaService.node.findMany({
      where: { id: { in: nodeConnections.data.map((nc) => nc.childNodeId) } },
      select: {
        id: true,
        code: true,
        label: true,
        status: true,
        nodeType: {
          select: {
            id: true,
            label: true,
          },
        },
        Individual: {
          where: {
            status: true,
          },
          select: {
            id: true,
            code: true,
            status: true,
            DataRow: {
              select: {
                id: true,
                value: true,
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
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    // prepare the response
    let data = formatNodeData(node);
    data['children'] = nodes.map((n) => formatNodeData(n));

    // return the response
    return {
      message: translate('Node children retrieved successfully'),
      data: {
        data: data,
        meta: nodeConnections.meta,
      },
    };
  }

  async firstChildrenWithHisChildren(
    distributionChannelId: number,
    nodePaginationDto: NodePaginationDto,
  ) {
    // Vérifier si le canal de distribution existe
    const distributionChannel =
      await this.prismaService.distributionChannel.findUnique({
        where: { id: distributionChannelId },
      });
    if (!distributionChannel)
      throw new NotFoundException(translate('Distribution channel not found'));

    // Récupérer les types de nœuds qui ne sont pas des parents
    const nodeTypes = await this.prismaService.nodeType.findMany({
      where: {
        nodeTypeParentId: 0,
        distributionChannelId,
      },
    });

    // Récupérer les nœuds de ces types
    const nodeTypeIds = nodeTypes.map((nt) => nt.id);
    const options = {
      where: {
        nodeTypeId: { in: nodeTypeIds },
        isDeleted: false,
      },
      select: {
        id: true,
        code: true,
        label: true,
        status: true,
        nodeType: {
          select: {
            id: true,
            label: true,
          },
        },
        Individual: {
          where: {
            status: true,
          },
          select: {
            id: true,
            code: true,
            status: true,
            DataRow: {
              select: {
                id: true,
                value: true,
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
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    };

    const nodes = await this.sharedSevice.paginate(
      this.prismaService.node,
      nodePaginationDto as PaginationDto,
      options,
    );

    // Récupérer les enfants de chaque nœud
    let node_datas = [];
    for (const node of nodes.data) {
      const childrenConnections =
        await this.prismaService.nodeConnection.findMany({
          where: { parentNodeId: node.id, isActive: true },
          select: { childNodeId: true },
        });

      const children = await this.prismaService.node.findMany({
        where: { id: { in: childrenConnections.map((nc) => nc.childNodeId) } },
        select: {
          id: true,
          code: true,
          status: true,
          nodeType: {
            select: {
              id: true,
              label: true,
            },
          },
          Individual: {
            where: {
              status: true,
            },
            select: {
              id: true,
              code: true,
              status: true,
              DataRow: {
                select: {
                  id: true,
                  value: true,
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
            take: 1,
            orderBy: {
              id: 'desc',
            },
          },
        },
      });

      node['children'] = children.map((child) => formatNodeData(child));
      // node_datas.push(formatNodeData(node));
      node_datas.push(node);
    }

    // Préparer la réponse
    const data = node_datas.map((n) => formatNodeData(n));

    return {
      message: translate(
        'First children with their children retrieved successfully',
      ),
      data: {
        data: data,
        meta: nodes.meta,
      },
    };
  }

  async update(id: number, updateNodeDto: UpdateNodeDto) {
    const { nodeTypeId, label, description, nodeParentId } = updateNodeDto;

    // Vérifier si le noeud existe
    const node = await this.prismaService.node.findUnique({
      where: { id },
      include: {
        nodeType: true,
        Individual: {
          where: { status: true },
          orderBy: { id: 'desc' },
        },
      },
    });
    if (!node) throw new NotFoundException(translate('Node not found'));

    // Vérifier si le type de noeud existe
    const nodeType = await this.prismaService.nodeType.findUnique({
      where: { id: nodeTypeId },
    });
    if (!nodeType) {
      throw new NotFoundException(translate('Node type does not exist'));
    }

    // Vérifier si le parent du noeud existe (si défini)
    if (nodeParentId) {
      const nodeParent = await this.prismaService.node.findUnique({
        where: { id: nodeParentId },
      });
      if (!nodeParent) {
        throw new NotFoundException(translate('Node parent does not exist'));
      }
      if (nodeParentId === node.id) {
        throw new ForbiddenException(
          translate('Node cannot be its own parent'),
        );
      }
      // Si le type de parent est défini, vérifier si le parent est du bon type
      if (
        nodeType.nodeTypeParentId &&
        nodeParent.nodeTypeId !== nodeType.nodeTypeParentId
      )
        throw new ForbiddenException(
          translate('Node parent type is not allowed'),
        );
    }

    // Vérifier si le slug existe déjà
    const value = getSlug(label);
    const existingNode = await this.prismaService.node.findFirst({
      where: { value },
    });
    if (existingNode && existingNode.id !== id) {
      throw new ConflictException(translate('Slug already exists'));
    }

    // Mettre à jour le noeud
    const updatedNode = await this.prismaService.node.update({
      where: { id },
      data: { nodeTypeId, label, value, description },
    });
    if (!updatedNode) {
      throw new InternalServerErrorException(
        translate('Node could not be updated'),
      );
    }

    // Récupérer la connexion actuelle du noeud
    const nodeCurrentConnection =
      await this.prismaService.nodeConnection.findFirst({
        where: { childNodeId: id, isActive: true },
      });

    // Si un parent est défini et qu'il est différent du parent actuel
    if (nodeParentId && nodeCurrentConnection?.parentNodeId !== nodeParentId) {
      if (nodeCurrentConnection) {
        // Désactiver la connexion actuelle
        const updatedNodeConnection =
          await this.prismaService.nodeConnection.update({
            where: { id: nodeCurrentConnection.id },
            data: {
              isActive: false,
              endAt: new Date(), // Ajout correct de la date
            },
          });
        if (!updatedNodeConnection) {
          throw new InternalServerErrorException(
            translate('Node connection could not be updated'),
          );
        }
      }

      // Créer une nouvelle connexion
      const newNodeConnection = await this.prismaService.nodeConnection.create({
        data: {
          parentNodeId: nodeParentId,
          childNodeId: id,
          isActive: true,
        },
      });
      if (!newNodeConnection) {
        throw new InternalServerErrorException(
          translate('Node connection could not be created'),
        );
      }
    }

    // Retourner la réponse
    return {
      message: translate('Node updated successfully'),
      data: updatedNode,
    };
  }

  async reconnect(id: number, reconnectNodeDto: ReconnectNodeDto) {
    const { nodeParentId } = reconnectNodeDto;

    const node = await this.prismaService.node.findUnique({
      where: { id },
    });
    if (!node) throw new NotFoundException(translate('Node not found'));

    // get the node connection
    const nodeConnection = await this.prismaService.nodeConnection.findFirst({
      where: {
        childNodeId: id,
        isActive: true,
      },
    });

    if (nodeParentId === node.id)
      throw new ForbiddenException(translate('Node cannot be its own parent'));

    // check if the node parent exists
    const nodeParent = await this.prismaService.node.findUnique({
      where: { id: nodeParentId },
    });
    if (!nodeParent)
      throw new NotFoundException(translate('Node parent does not exist'));

    if (nodeConnection && nodeParentId == nodeConnection.parentNodeId)
      throw new ForbiddenException(
        translate('Node is already connected to this parent'),
      );

    if (nodeConnection) {
      // deactive the node connection
      const updatedNodeConnection =
        await this.prismaService.nodeConnection.update({
          where: {
            id: nodeConnection.id,
          },
          data: {
            isActive: false,
            endAt: new Date(),
          },
        });
      if (!updatedNodeConnection)
        throw new InternalServerErrorException(
          translate('Node connection could not be updated'),
        );
    }

    // create a new node connection
    const newNodeConnection = await this.prismaService.nodeConnection.create({
      data: {
        parentNodeId: nodeParentId,
        childNodeId: id,
      },
    });
    if (!newNodeConnection)
      throw new InternalServerErrorException(
        translate('Node connection could not be created'),
      );

    // return the response
    return {
      message: translate('Node reconnected successfully'),
      data: newNodeConnection,
    };
  }

  async changeStatus(id: number) {
    const node = await this.prismaService.node.findUnique({
      where: { id },
    });
    if (!node) throw new NotFoundException(translate('Node not found'));
    // change the status
    const updatedNode = await this.prismaService.node.update({
      where: { id },
      data: { status: !node.status },
    });
    if (!updatedNode)
      throw new InternalServerErrorException(
        translate('Node status could not be changed'),
      );
    // return the response
    return {
      message: translate('Node status changed successfully'),
      data: updatedNode,
    };
  }

  async remove(id: number) {
    const node = await this.prismaService.node.findUnique({
      where: { id },
    });
    if (!node) throw new NotFoundException(translate('Node not found'));

    // get the node connection
    const nodeConnection = await this.prismaService.nodeConnection.findFirst({
      where: {
        childNodeId: id,
        isActive: true,
      },
    });

    if (nodeConnection) {
      // deactive the node connection
      const updatedNodeConnection =
        await this.prismaService.nodeConnection.update({
          where: {
            id: nodeConnection.id,
          },
          data: {
            isActive: false,
            endAt: new Date(),
          },
        });
      if (!updatedNodeConnection)
        throw new InternalServerErrorException(
          translate('Node connection could not be updated'),
        );
    }

    // delete the node
    const updatedNode = await this.prismaService.node.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
    if (!updatedNode)
      throw new InternalServerErrorException(
        translate('Node could not be deleted'),
      );

    // return the response
    return {
      message: translate('Node deleted successfully'),
      data: updatedNode,
    };
  }
}
