import { BookResponse } from '../responses/book.response';
import { BookCreateRequest } from '../requests/book-create.request';
import { BookService } from '../services/book.service';
import { Book } from 'src/models/book.model';

export class BookCRUDApplication {
    constructor(private readonly bookService: BookService) {}

    async detail(id: number): Promise<BookResponse> {
        const book = await this.bookService.findById(id);
        return {
            title: book.title,
            content: book.content,
        };
    }

    async create(bookRequest: BookCreateRequest): Promise<BookResponse> {
        const newBook = new Book();
        Object.assign(newBook, bookRequest);

        const createdBook = await this.bookService.create(newBook);

        return {
            title: createdBook.title,
            content: createdBook.content,
        };
    }

    async update(
        id: number,
        bookRequest: BookCreateRequest,
    ): Promise<BookResponse> {
        const oldBook = await this.bookService.findById(id);
        if (!oldBook) {
            return null;
        }

        const { title, content } = bookRequest;
        const createdBook = await this.bookService.update(oldBook, {
            title,
            content,
        });

        return {
            title: createdBook.title,
            content: createdBook.content,
        };
    }

    async delete(id: number): Promise<boolean> {
        const oldBook = await this.bookService.findById(id);
        if (!oldBook) {
            return null;
        }

        await this.bookService.delete(oldBook);

        return true;
    }
}
