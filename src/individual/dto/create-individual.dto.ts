import { IsNotEmpty, IsNumber, IsObject } from "class-validator";

export class CreateIndividualDto {

    @IsNotEmpty()
    @IsNumber()
    readonly nodeId: number;

    @IsNotEmpty()
    @IsObject()
    readonly data: object;
}
