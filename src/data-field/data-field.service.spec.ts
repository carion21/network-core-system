import { Test, TestingModule } from '@nestjs/testing';
import { DataFieldService } from './data-field.service';

describe('DataFieldService', () => {
  let service: DataFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataFieldService],
    }).compile();

    service = module.get<DataFieldService>(DataFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
