import { Module } from '@nestjs/common';
import { SysUserService } from './sys-user.service';
import { SysUserController } from './sys-user.controller';

@Module({
  controllers: [SysUserController],
  providers: [SysUserService],
})
export class SysUserModule {}
