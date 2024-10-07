import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSysUserDto } from './dto/create-sys-user.dto';
import { UpdateSysUserDto } from './dto/update-sys-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  generateFriendlyUsername,
  generatePassword,
} from 'utilities/functions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SysUserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createSysUserDto: CreateSysUserDto) {
    const { name, description, role } = createSysUserDto;

    const username = generateFriendlyUsername();
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    const sysUserData = {
      name: name,
      description: description,
      role: role,
      username: username,
      password: hashedPassword,
    };

    const sysUser = await this.prismaService.sysUser.create({
      data: sysUserData,
    });

    sysUserData.password = password;

    return {
      message: 'SysUser created successfully',
      data: sysUserData,
    };
  }

  async findAll() {
    const sysUsers = await this.prismaService.sysUser.findMany();

    return {
      message: 'SysUser list',
      data: sysUsers,
    };
  }

  findOne(id: number) {
    const sysUser = this.prismaService.sysUser.findUnique({
      where: { id: id },
    });
    if (!sysUser) throw new NotFoundException('SysUser not found');

    return {
      message: 'SysUser details',
      data: sysUser,
    };
  }

  async changeStatus(id: number) {
    const sysUser = await this.prismaService.sysUser.findUnique({
      where: { id: id },
    });
    if (!sysUser) throw new NotFoundException('SysUser not found');

    const updatedSysUser = this.prismaService.sysUser.update({
      where: { id: id },
      data: {
        status: !sysUser.status,
      },
    });

    return {
      message: 'SysUser status changed',
      data: updatedSysUser,
    };
  }
}
