import { Injectable } from '@nestjs/common';
import { CreateDataFieldTypeDto } from './dto/create-data-field-type.dto';
import { UpdateDataFieldTypeDto } from './dto/update-data-field-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DataFieldTypeService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDataFieldTypeDto: CreateDataFieldTypeDto) {
    return 'This action adds a new dataFieldType';
  }

  async findAll() {
    const dataFieldTypes = await this.prismaService.dataFieldType.findMany();
    // return the response
    return {
      message: 'Data field types retrieved successfully',
      data: dataFieldTypes,
    };
  }

  async findOne(id: number) {
    const dataFieldType = await this.prismaService.dataFieldType.findUnique({
      where: { id },
    });
    // return the response
    return {
      message: 'Data field type retrieved successfully',
      data: dataFieldType,
    };
  }

  update(id: number, updateDataFieldTypeDto: UpdateDataFieldTypeDto) {
    return `This action updates a #${id} dataFieldType`;
  }

  changeStatus(id: number) {
    throw new Error('Method not implemented.');
  }
}
