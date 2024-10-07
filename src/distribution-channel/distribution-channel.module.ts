import { Module } from '@nestjs/common';
import { DistributionChannelService } from './distribution-channel.service';
import { DistributionChannelController } from './distribution-channel.controller';

@Module({
  controllers: [DistributionChannelController],
  providers: [DistributionChannelService],
})
export class DistributionChannelModule {}
