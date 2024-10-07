import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class NodeDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'nodeId doit être différent de 0' })  // nodeParentId doit être >= 1
    readonly nodeId: number;

    @IsNotEmpty()
    @IsObject()
    readonly data: object;
}

export class UpdateNodesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NodeDto)
    @IsNotEmpty()
    readonly nodes: NodeDto[];
}
