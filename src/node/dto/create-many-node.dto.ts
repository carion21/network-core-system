import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateNodeDto } from './create-node.dto';

export class CreateManyNodeDto {
  @IsArray()
  @ArrayMinSize(1) // Optionnel : Assure qu'au moins un élément est présent
  @ValidateNested({ each: true })
  @Type(() => CreateNodeDto)
  readonly nodes: CreateNodeDto[];
}
