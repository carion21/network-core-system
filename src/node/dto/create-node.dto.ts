import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateNodeDto {

    @IsNotEmpty()
    @IsNumber()
    readonly nodeTypeId: number;

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;

    @IsNumber()
    readonly nodeParentId: number;
}
