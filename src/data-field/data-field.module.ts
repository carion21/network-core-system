import { Module } from '@nestjs/common';
import { DataFieldService } from './data-field.service';
import { DataFieldController } from './data-field.controller';

@Module({
  controllers: [DataFieldController],
  providers: [DataFieldService],
})
export class DataFieldModule {}
