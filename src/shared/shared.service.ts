import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SharedService {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    model: any,
    paginationDto: PaginationDto,
    options?: { where?: any; include?: any },
  ) {
    const { page, limit, sort, sortBy } = paginationDto;
    const skip = (page - 1) * limit;
    const take = +limit;

    // Construction dynamique de l'option `orderBy` pour Prisma
    const prismaOptions = {
      skip,
      take,
      orderBy: {
        [sortBy]: sort, // Tri par champ (sortBy) et direction (sort) spécifiés
      },
      ...options,
    };

    const [data, totalItems] = await Promise.all([
      model.findMany(prismaOptions),
      model.count({ where: options?.where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const itemCount = data.length;

    return {
      data,
      meta: {
        totalItems,
        itemCount,
        itemsPerPage: +limit,
        totalPages,
        currentPage: +page,
      },
    };
  }
}
