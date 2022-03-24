import { IBook } from 'src/entities/book.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'books' })
export class Book implements IBook {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;
}
