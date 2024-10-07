import { PartialType } from '@nestjs/swagger';
import { CreateDataFieldTypeDto } from './create-data-field-type.dto';

export class UpdateDataFieldTypeDto extends PartialType(CreateDataFieldTypeDto) {}
