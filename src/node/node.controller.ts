import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ApiTags } from '@nestjs/swagger';
import { ReconnectNodeDto } from './dto/reconnect-node.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { CreateManyNodeDto } from './dto/create-many-node.dto';
import { NodePaginationDto } from 'src/shared/dto/node-pagination.dto';

@ApiTags('Gestion des noeuds')
@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post('many')
  createMany(@Body() createManyNodeDto: CreateManyNodeDto) {
    return this.nodeService.createMany(createManyNodeDto);
  }

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.create(createNodeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.nodeService.findAll(paginationDto);
  }

  @Get('tree/:id')
  getTree(@Param('id') id: string) {
    return this.nodeService.getTree(+id);
  }

  @Get('first-children/:distributionChannelId')
  firstChildren(
    @Param('distributionChannelId') distributionChannelId: string,
    @Query() nodePaginationDto: NodePaginationDto,
  ) {
    return this.nodeService.firstChildren(
      +distributionChannelId,
      nodePaginationDto,
    );
  }

  @Get('first-children-with-his-children/:distributionChannelId')
  firstChildrenWithHisChildren(
    @Param('distributionChannelId') distributionChannelId: string,
    @Query() nodePaginationDto: NodePaginationDto,
  ) {
    return this.nodeService.firstChildrenWithHisChildren(
      +distributionChannelId,
      nodePaginationDto,
    );
  }

  @Get('show-children/:id')
  showChildren(
    @Param('id') id: string,
    @Query() nodePaginationDto: NodePaginationDto,
  ) {
    return this.nodeService.showChildren(+id, nodePaginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: UpdateNodeDto) {
    return this.nodeService.update(+id, updateNodeDto);
  }

  @Patch('reconnect/:id')
  reconnect(
    @Param('id') id: string,
    @Body() reconnectNodeDto: ReconnectNodeDto,
  ) {
    return this.nodeService.reconnect(+id, reconnectNodeDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.nodeService.changeStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodeService.remove(+id);
  }
}
