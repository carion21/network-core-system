import { IsArray, IsNotEmpty } from "class-validator";


export class DeleteNodesDto {
    @IsArray()
    @IsNotEmpty()
    readonly nodeIds: number[];
}
