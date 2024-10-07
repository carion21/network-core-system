import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateNodeTypeDto {

    @IsNotEmpty()
    @IsNumber()
    readonly distributionChannelId: number;

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;

    @IsNumber()
    readonly nodeTypeParentId: number;
}
