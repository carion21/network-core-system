import { IsArray, IsNotEmpty, IsNumber, ValidateNested, Min } from "class-validator";
import { Type } from "class-transformer";

class ReconnectNodeDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'nodeParentId doit être différent de 0' })  // nodeParentId doit être >= 1
    readonly nodeParentId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'nodeTypeId doit être différent de 0' })  // nodeTypeId doit être >= 1
    readonly nodeChildId: number;
}

export class ReconnectNodesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReconnectNodeDto)
    @IsNotEmpty()
    readonly nodes: ReconnectNodeDto[];
}
