import { IsNotEmpty, IsString } from 'class-validator';

export class SearchEntityDto {

    @IsNotEmpty()
    @IsString()
    readonly content: string;

}
