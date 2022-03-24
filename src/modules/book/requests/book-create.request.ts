import { IsNotEmpty, IsString } from 'class-validator';

export class BookCreateRequest {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}
