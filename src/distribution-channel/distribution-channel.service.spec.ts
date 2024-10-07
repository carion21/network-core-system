import { Test, TestingModule } from '@nestjs/testing';
import { DistributionChannelService } from './distribution-channel.service';

describe('DistributionChannelService', () => {
  let service: DistributionChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionChannelService],
    }).compile();

    service = module.get<DistributionChannelService>(DistributionChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
