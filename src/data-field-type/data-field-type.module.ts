import { Module } from '@nestjs/common';
import { DataFieldTypeService } from './data-field-type.service';
import { DataFieldTypeController } from './data-field-type.controller';

@Module({
  controllers: [DataFieldTypeController],
  providers: [DataFieldTypeService],
})
export class DataFieldTypeModule {}
