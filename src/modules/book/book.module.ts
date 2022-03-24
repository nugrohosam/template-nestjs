import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookController } from './controllers/book.controller';
import { BookReturnSchedule } from './scheduler/book-return-schedule.service';
import { BookService } from './services/book.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [BookController],
    providers: [
        //Scheduler

        BookReturnSchedule,

        BookService,
    ],
    exports: [
        // for application here
    ],
})
export class BookModule {}
