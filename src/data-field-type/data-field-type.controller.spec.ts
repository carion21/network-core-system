import { Test, TestingModule } from '@nestjs/testing';
import { DataFieldTypeController } from './data-field-type.controller';
import { DataFieldTypeService } from './data-field-type.service';

describe('DataFieldTypeController', () => {
  let controller: DataFieldTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataFieldTypeController],
      providers: [DataFieldTypeService],
    }).compile();

    controller = module.get<DataFieldTypeController>(DataFieldTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
