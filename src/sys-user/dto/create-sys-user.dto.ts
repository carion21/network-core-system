import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreateSysUserDto {

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    readonly description: string;

    @IsString()
    @IsIn(['web', 'job'])
    readonly role: string;
}
