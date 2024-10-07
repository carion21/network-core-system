import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateNodesDto } from './dto/create-nodes.dto';
import { UpdateNodesDto } from './dto/update-nodes.dto';
import { DeleteNodesDto } from './dto/delete-nodes.dto';
import { ReconnectNodesDto } from './dto/reconnect-nodes.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('EndPoints pour les jobs')
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post('create-nodes')
  createNodes(@Body() createNodesDto: CreateNodesDto, @Req() request: Request) {
    let userAuthenticated = request['user'];

    return this.jobService.createNodes(createNodesDto, userAuthenticated);
  }

  // @Post('retrieve-individuals')
  // retrieveIndividuals() {
  //   return this.jobService.retrieveIndividuals();
  // }

  @Patch('reconnect-nodes')
  reconnectNodes(@Body() reconnectNodesDto: ReconnectNodesDto) {
    return this.jobService.reconnectNodes(reconnectNodesDto);
  }

  @Patch('update-nodes')
  updateNodesData(
    @Body() updateNodesDto: UpdateNodesDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];

    return this.jobService.updateNodes(updateNodesDto, userAuthenticated);
  }

  @Delete('delete-nodes')
  removeNodes(@Body() deleteNodesDto: DeleteNodesDto) {
    return this.jobService.deleteNodes(deleteNodesDto);
  }
}
