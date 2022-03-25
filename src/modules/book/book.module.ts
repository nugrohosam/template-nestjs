import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/models/book.model';
import { BookCRUDApplication } from './applications/book-crud.application';
import { BookIndexApplication } from './applications/book-index.application';
import { BookController } from './controllers/book.controller';
import { BookReturnSchedule } from './scheduler/book-return-schedule.service';
import { BookService } from './services/book.service';

@Module({
    imports: [TypeOrmModule.forFeature([Book])],
    controllers: [BookController],
    providers: [
        //Scheduler

        BookReturnSchedule,

        BookService,

        BookIndexApplication,
        BookCRUDApplication,
    ],
    exports: [
        // export module
    ],
})
export class BookModule {}
