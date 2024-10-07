import { PartialType } from '@nestjs/swagger';
import { CreateDataFieldDto } from './create-data-field.dto';

export class UpdateDataFieldDto extends PartialType(CreateDataFieldDto) {}
