import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { genEntityCode, getSlug, translate } from 'utilities/functions';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SharedService } from 'src/shared/shared.service';

@Injectable()
export class EntityService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedService: SharedService,
  ) {}

  async create(createEntityDto: CreateEntityDto) {
    const { label, description } = createEntityDto;
    // check if slug exists
    const value = getSlug(label);
    const exists = await this.prismaService.entity.findFirst({
      where: {
        value,
      },
    });
    if (exists) throw new ConflictException(translate('Slug already exists'));
    const entity = await this.prismaService.entity.create({
      data: {
        code: genEntityCode(),
        label,
        value,
        description,
      },
    });
    if (!entity)
      throw new InternalServerErrorException(translate('Entity not created'));
    // return the response
    return {
      message: translate('Entity created successfully'),
      data: entity,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const options = {
      include: {
        DistributionChannel: true,
      }
    };
    // const entities = await this.prismaService.entity.findMany();
    const entities = await this.sharedService.paginate(
      this.prismaService.entity,
      paginationDto,
      options,
    );

    // return the response
    return {
      message: translate('Entities retrieved successfully'),
      data: entities,
    };
  }

  async findOne(id: number) {
    const entity = await this.prismaService.entity.findUnique({
      where: {
        id,
      },
      include: {
        DistributionChannel: true,
      },
    });
    if (!entity) throw new NotFoundException(translate('Entity not found'));
    // return the response
    return {
      message: translate('Entity retrieved successfully'),
      data: entity,
    };
  }

  async update(id: number, updateEntityDto: UpdateEntityDto) {
    const { label, description } = updateEntityDto;

    // check if entity exists
    let entity = await this.prismaService.entity.findUnique({
      where: {
        id,
      },
      include: {
        DistributionChannel: true,
      },
    });

    // check if slug exists
    const value = getSlug(label);
    const exists = await this.prismaService.entity.findFirst({
      where: {
        value,
        id: {
          not: id,
        },
      },
    });
    if (exists) throw new ConflictException(translate('Slug already exists'));

    // update the entity
    const updatedEntity = await this.prismaService.entity.update({
      where: {
        id,
      },
      data: {
        label,
        value,
        description,
      },
    });
    if (!updatedEntity)
      throw new InternalServerErrorException(translate('Entity not updated'));

    // reload the entity
    entity = await this.prismaService.entity.findUnique({
      where: {
        id,
      },
      include: {
        DistributionChannel: true,
      },
    });

    // return the response
    return {
      message: translate('Entity updated successfully'),
      data: entity,
    };
  }

  async changeStatus(id: number) {
    const entity = await this.prismaService.entity.findUnique({
      where: {
        id,
      },
    });
    if (!entity) throw new NotFoundException(translate('Entity not found'));
    const entityUpdated = await this.prismaService.entity.update({
      where: {
        id,
      },
      data: {
        status: !entity.status,
      },
    });
    if (!entityUpdated)
      throw new InternalServerErrorException(
        translate('Entity status not updated'),
      );
    // return the response
    return {
      message: translate('Entity status updated successfully'),
      data: entityUpdated,
    };
  }
}
