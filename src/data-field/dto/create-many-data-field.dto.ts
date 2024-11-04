import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateDataFieldDto } from './create-data-field.dto';

export class CreateManyDataFieldDto {
  @IsArray()
  @ArrayMinSize(1) // Optionnel : Assure qu'au moins un élément est présent
  @ValidateNested({ each: true })
  @Type(() => CreateDataFieldDto)
  readonly dataFields: CreateDataFieldDto[];
}
