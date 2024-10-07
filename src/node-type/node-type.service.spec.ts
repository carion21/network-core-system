import { Test, TestingModule } from '@nestjs/testing';
import { NodeTypeService } from './node-type.service';

describe('NodeTypeService', () => {
  let service: NodeTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeTypeService],
    }).compile();

    service = module.get<NodeTypeService>(NodeTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
