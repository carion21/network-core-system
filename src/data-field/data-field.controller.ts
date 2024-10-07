import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataFieldService } from './data-field.service';
import { CreateDataFieldDto } from './dto/create-data-field.dto';
import { UpdateDataFieldDto } from './dto/update-data-field.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gestion des champs de données')
@Controller('data-field')
export class DataFieldController {
  constructor(private readonly dataFieldService: DataFieldService) {}

  @Post()
  create(@Body() createDataFieldDto: CreateDataFieldDto) {
    return this.dataFieldService.create(createDataFieldDto);
  }

  @Get()
  findAll() {
    return this.dataFieldService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataFieldService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataFieldDto: UpdateDataFieldDto) {
    return this.dataFieldService.update(+id, updateDataFieldDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.dataFieldService.changeStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataFieldService.remove(+id);
  }
}
