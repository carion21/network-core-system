import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ApiTags } from '@nestjs/swagger';
import { ReconnectNodeDto } from './dto/reconnect-node.dto';

@ApiTags('Gestion des noeuds')
@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.create(createNodeDto);
  }

  @Get()
  findAll() {
    return this.nodeService.findAll();
  }

  @Get('tree/:id')
  getTree(@Param('id') id: string) {
    return this.nodeService.getTree(+id);
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
  reconnect(@Param('id') id: string, @Body() reconnectNodeDto: ReconnectNodeDto) {
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
