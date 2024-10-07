import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { isEmail } from 'class-validator';

import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    const sysUser = await this.prismaService.sysUser.findFirst({
      where: {
        username: username,
      },
    });

    // Verify if the user exists in the database
    if (!sysUser) throw new NotFoundException('SysUser not found');

    // Verify if the password is correct
    const match = await bcrypt.compare(password, sysUser.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Generate the JWT
    Reflect.deleteProperty(sysUser, 'password');
    Reflect.deleteProperty(sysUser, 'createdAt');
    Reflect.deleteProperty(sysUser, 'updatedAt');
    const payload = {
      sub: sysUser.id,
      username: sysUser.username,
      role: sysUser.role,
    };

    const jwt = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });

    // Return the response
    return {
      message: 'SysUser logged in successfully',
      data: {
        accessToken: jwt,
        sysUser: sysUser,
      },
    };
  }
}
