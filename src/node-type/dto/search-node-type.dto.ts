import { IsNotEmpty, IsString } from "class-validator";

export class SearchNodeTypeDto {

    @IsNotEmpty()
    @IsString()
    readonly content: string;

}
