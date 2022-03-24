import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IBook } from 'src/entities/book.entity';
import { Book } from 'src/models/book.model';
import { Repository } from 'typeorm';

@Injectable()
export class BookService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<IBook>,
    ) {}

    async findById(id: number): Promise<IBook> {
        return await this.bookRepository.findOne(id);
    }

    async create(book: IBook): Promise<IBook> {
        const newBook = this.bookRepository.create(book);
        return await this.bookRepository.save(newBook);
    }

    async update(book: IBook, updateData: Partial<IBook>): Promise<IBook> {
        this.bookRepository.update(book, updateData);
        return await this.bookRepository.save(book);
    }

    async delete({ id }: IBook): Promise<void> {
        await this.bookRepository.delete(id);
    }
}
