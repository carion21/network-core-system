import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistributionChannelService } from './distribution-channel.service';
import { CreateDistributionChannelDto } from './dto/create-distribution-channel.dto';
import { UpdateDistributionChannelDto } from './dto/update-distribution-channel.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gestion des canaux de distribution')
@Controller('distribution-channel')
export class DistributionChannelController {
  constructor(private readonly distributionChannelService: DistributionChannelService) {}

  @Post()
  create(@Body() createDistributionChannelDto: CreateDistributionChannelDto) {
    return this.distributionChannelService.create(createDistributionChannelDto);
  }

  @Get()
  findAll() {
    return this.distributionChannelService.findAll();
  }

  @Get('generate-interface-contract/:id')
  generateInterfaceContract(@Param('id') id: string) {
    return this.distributionChannelService.generateInterfaceContract(+id);
  }

  @Get('tree/:id')
  getTree(@Param('id') id: string) {
    return this.distributionChannelService.getTree(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributionChannelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDistributionChannelDto: UpdateDistributionChannelDto) {
    return this.distributionChannelService.update(+id, updateDistributionChannelDto);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.distributionChannelService.changeStatus(+id);
  }
}
