import { IsNotEmpty, IsNumber } from "class-validator";

export class ReconnectNodeDto {

    @IsNotEmpty()
    @IsNumber()
    readonly nodeParentId: number;
}
