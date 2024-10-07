import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEntityDto {

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;
}
