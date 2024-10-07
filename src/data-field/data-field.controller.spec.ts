import { Test, TestingModule } from '@nestjs/testing';
import { DataFieldController } from './data-field.controller';
import { DataFieldService } from './data-field.service';

describe('DataFieldController', () => {
  let controller: DataFieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFieldController],
      providers: [DataFieldService],
    }).compile();

    controller = module.get<DataFieldController>(DataFieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
