import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEntityDto {

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;
}
