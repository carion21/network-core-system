import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateDistributionChannelDto {

    @IsNotEmpty()
    @IsNumber()
    readonly entityId: number;

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;
}
