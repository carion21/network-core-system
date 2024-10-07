import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { defaultIfEmpty } from "rxjs";

export class CreateDataFieldDto {

    @IsNotEmpty()
    @IsNumber()
    readonly nodeTypeId: number;

    @IsNotEmpty()
    @IsNumber()
    readonly dataFieldTypeId: number;

    @IsBoolean()
    readonly isPrimaryKey: boolean = false;

    @IsNotEmpty()
    @IsString()
    readonly label: string;

    @IsString()
    readonly description: string;

    @IsNotEmpty()
    @IsBoolean()
    readonly optionnal: boolean;

    @IsString()
    readonly fillingType: string;

    @IsString()
    readonly defaultValue: string;

    @IsString()
    readonly exampleValue: string;
}
