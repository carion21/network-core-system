import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Consts } from 'utilities/constants';
import { genDataFieldTypeCode } from 'utilities/functions';

@Injectable()
export class SeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute() {
    const dataFieldTypes = await this.prismaService.dataFieldType.findMany();
    if (dataFieldTypes.length > 0)
      throw new ConflictException('DataFieldTypes already seeded');

    const newDataFieldTypes = await this.prismaService.dataFieldType.createMany(
      {
        data: Consts.DEFAULT_FIELD_TYPES.map((ftype) => ({
          code: genDataFieldTypeCode(),
          label: ftype['label'],
          value: ftype['value'],
          description: `Il s'agit du type de champ ${ftype['label']}`,
        })),
      },
    );
    return {
      message: 'Seed executed successfully',
      data: newDataFieldTypes,
    };
  }
}
