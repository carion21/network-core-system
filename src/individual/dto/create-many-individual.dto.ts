import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateIndividualDto } from './create-individual.dto';

export class CreateManyIndividualDto {
  @IsArray()
  @ArrayMinSize(1) // Optionnel : Assure qu'au moins un élément est présent
  @ValidateNested({ each: true })
  @Type(() => CreateIndividualDto)
  readonly individuals: CreateIndividualDto[];
}
