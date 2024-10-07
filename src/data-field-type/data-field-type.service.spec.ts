import { Test, TestingModule } from '@nestjs/testing';
import { DataFieldTypeService } from './data-field-type.service';

describe('DataFieldTypeService', () => {
  let service: DataFieldTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataFieldTypeService],
    }).compile();

    service = module.get<DataFieldTypeService>(DataFieldTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
