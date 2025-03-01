import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { NodeTypeService } from './node-type.service';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { SearchNodeTypeDto } from './dto/search-node-type.dto';

@ApiTags('Gestion des types de noeuds')
@Controller('node-type')
export class NodeTypeController {
  constructor(private readonly nodeTypeService: NodeTypeService) {}

  @Post('search')
  search(@Body() searchNodeTypeDto: SearchNodeTypeDto) {
    return this.nodeTypeService.search(searchNodeTypeDto);
  }

  @Post()
  create(@Body() createNodeTypeDto: CreateNodeTypeDto) {
    return this.nodeTypeService.create(createNodeTypeDto);
  }

  @Get('by-distribution-channel/:distributionChannelId')
  findAllByDistributionChannel(@Param('distributionChannelId') distributionChannelId: string, @Query() paginationDto: PaginationDto) {
    return this.nodeTypeService.findAllByDistributionChannel(+distributionChannelId, paginationDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nodeTypeService.findAll(paginationDto);
  }

  //generate model excel
  @Get('generate-model-excel/:id')
  generateModelExcel(@Param('id') id: string, @Res() res: Response) {
    return this.nodeTypeService.generateModelExcel(+id, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodeTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeTypeDto: UpdateNodeTypeDto) {
    return this.nodeTypeService.update(+id, updateNodeTypeDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.nodeTypeService.changeStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodeTypeService.remove(+id);
  }
}
