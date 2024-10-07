import { Test, TestingModule } from '@nestjs/testing';
import { NodeTypeController } from './node-type.controller';
import { NodeTypeService } from './node-type.service';

describe('NodeTypeController', () => {
  let controller: NodeTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeTypeController],
      providers: [NodeTypeService],
    }).compile();

    controller = module.get<NodeTypeController>(NodeTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
