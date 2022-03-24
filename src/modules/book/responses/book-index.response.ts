import { IBook } from 'src/entities/book.entity';
import { Book } from 'src/models/book.model';

export class BookIndexResponse implements Omit<IBook, 'id'> {
    id: number;
    title?: string;
    content: string;

    static mapFromPartyModel(book: Book): BookIndexResponse {
        // TODO converting response data can be handled on bookModel
        return {
            id: book.id,
            title: book.title,
            content: book.content,
        };
    }
}
