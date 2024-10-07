import { IsArray, IsNotEmpty } from "class-validator";


export class RetrieveIndividualsDto {
    @IsArray()
    @IsNotEmpty()
    readonly nodeIds: number[];
}
