import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SysUserService } from './sys-user.service';
import { CreateSysUserDto } from './dto/create-sys-user.dto';
import { UpdateSysUserDto } from './dto/update-sys-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gestion des utilisateurs système')
@Controller('sys-user')
export class SysUserController {
  constructor(private readonly sysUserService: SysUserService) {}

  @Post()
  create(@Body() createSysUserDto: CreateSysUserDto) {
    return this.sysUserService.create(createSysUserDto);
  }

  @Get()
  findAll() {
    return this.sysUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sysUserService.findOne(+id);
  }

  @Patch('change-status/:id')
  changeStatus(@Param('id') id: string) {
    return this.sysUserService.changeStatus(+id);
  }
}
