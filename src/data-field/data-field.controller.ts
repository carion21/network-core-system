import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DataFieldService } from './data-field.service';
import { CreateDataFieldDto } from './dto/create-data-field.dto';
import { UpdateDataFieldDto } from './dto/update-data-field.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { CreateManyDataFieldDto } from './dto/create-many-data-field.dto';

@ApiTags('Gestion des champs de données')
@Controller('data-field')
export class DataFieldController {
  constructor(private readonly dataFieldService: DataFieldService) {}

  @Post('many')
  createMany(@Body() createManyDataFieldDto: CreateManyDataFieldDto) {
    return this.dataFieldService.createMany(createManyDataFieldDto);
  }

  @Post()
  create(@Body() createDataFieldDto: CreateDataFieldDto) {
    return this.dataFieldService.create(createDataFieldDto);
  }

  @Get('by-node-type/:nodeTypeId')
  findAllByNodeType(@Param('nodeTypeId') nodeTypeId: string, @Query() paginationDto: PaginationDto) {
    return this.dataFieldService.findAllByNodeType(+nodeTypeId, paginationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.dataFieldService.findAll(paginationDto);
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
