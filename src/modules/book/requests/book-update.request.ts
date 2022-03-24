import { IsNotEmpty, IsString } from 'class-validator';

export class BookUpdateRequest {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}
