import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataFieldTypeService } from './data-field-type.service';
import { CreateDataFieldTypeDto } from './dto/create-data-field-type.dto';
import { UpdateDataFieldTypeDto } from './dto/update-data-field-type.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gestion des types de champs de données')
@Controller('data-field-type')
export class DataFieldTypeController {
  constructor(private readonly dataFieldTypeService: DataFieldTypeService) {}

  @Post()
  create(@Body() createDataFieldTypeDto: CreateDataFieldTypeDto) {
    return this.dataFieldTypeService.create(createDataFieldTypeDto);
  }

  @Get()
  findAll() {
    return this.dataFieldTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataFieldTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataFieldTypeDto: UpdateDataFieldTypeDto) {
    return this.dataFieldTypeService.update(+id, updateDataFieldTypeDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.dataFieldTypeService.changeStatus(+id);
  }
}
