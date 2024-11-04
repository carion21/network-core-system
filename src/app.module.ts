import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntityModule } from './entity/entity.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DistributionChannelModule } from './distribution-channel/distribution-channel.module';
import { NodeTypeModule } from './node-type/node-type.module';
import { NodeModule } from './node/node.module';
import { IndividualModule } from './individual/individual.module';
import { DataFieldModule } from './data-field/data-field.module';
import { DataFieldTypeModule } from './data-field-type/data-field-type.module';
import { SeedModule } from './seed/seed.module';
import { SysUserModule } from './sys-user/sys-user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SeedModule,
    SysUserModule,
    AuthModule,
    EntityModule,
    DistributionChannelModule,
    NodeTypeModule,
    NodeModule,
    DataFieldTypeModule,
    DataFieldModule,
    IndividualModule,
    JobModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
