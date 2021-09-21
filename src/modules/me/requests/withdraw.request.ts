import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WithdrawRequest {
    @IsNotEmpty()
    @IsNumber()
    percentage: number;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
