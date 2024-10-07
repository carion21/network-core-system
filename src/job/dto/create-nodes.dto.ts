import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class NodeDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'nodeTypeId doit être différent de 0' })  // nodeParentId doit être >= 1
    readonly nodeTypeId: number;

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;

    @IsNumber()
    readonly nodeParentId: number;

    @IsNotEmpty()
    @IsObject()
    readonly data: object;
}

export class CreateNodesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NodeDto)
    @IsNotEmpty()
    readonly nodes: NodeDto[];
}
