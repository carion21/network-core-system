import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SearchEntityDto } from './dto/search-entity.dto';

@ApiTags('Gestion des entités')
@Controller('entity')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  @Post('search')
  search(@Body() searchEntityDto: SearchEntityDto) {
    return this.entityService.search(searchEntityDto);
  }

  @Post()
  create(@Body() createEntityDto: CreateEntityDto) {
    return this.entityService.create(createEntityDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.entityService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntityDto: UpdateEntityDto) {
    return this.entityService.update(+id, updateEntityDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.entityService.changeStatus(+id);
  }
}
