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
import { IndividualService } from './individual.service';
import { CreateIndividualDto } from './dto/create-individual.dto';
import { UpdateIndividualDto } from './dto/update-individual.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { CreateManyIndividualDto } from './dto/create-many-individual.dto';

@ApiTags('Gestion des individus')
@Controller('individual')
export class IndividualController {
  constructor(private readonly individualService: IndividualService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('replace')
  replace(
    @Body() createIndividualDto: CreateIndividualDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];

    return this.individualService.create(
      createIndividualDto,
      userAuthenticated,
      true,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  createMany(
    @Body() createManyIndividualDto: CreateManyIndividualDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];

    return this.individualService.createMany(
      createManyIndividualDto,
      userAuthenticated,
      false,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() createIndividualDto: CreateIndividualDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];

    return this.individualService.create(
      createIndividualDto,
      userAuthenticated,
      false,
    );
  }

  @Get()
  findAll(paginationDto: PaginationDto) {
    return this.individualService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.individualService.findOne(+id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndividualDto: UpdateIndividualDto,
    @Req() request: Request,
  ) {
    let userAuthenticated = request['user'];

    return this.individualService.update(
      +id,
      updateIndividualDto,
      userAuthenticated,
    );
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.individualService.changeStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.individualService.remove(+id);
  }
}
