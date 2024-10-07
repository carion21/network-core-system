import { Test, TestingModule } from '@nestjs/testing';
import { DistributionChannelController } from './distribution-channel.controller';
import { DistributionChannelService } from './distribution-channel.service';

describe('DistributionChannelController', () => {
  let controller: DistributionChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionChannelController],
      providers: [DistributionChannelService],
    }).compile();

    controller = module.get<DistributionChannelController>(DistributionChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
