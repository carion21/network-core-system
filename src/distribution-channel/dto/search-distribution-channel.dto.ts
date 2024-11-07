import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDistributionChannelDto {

    @IsNotEmpty()
    @IsString()
    readonly content: string;

}
