import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { BookCRUDApplication } from '../applications/book-crud.application';
import { BookIndexApplication } from '../applications/book-index.application';
import { BookCreateRequest } from '../requests/book-create.request';
import { BookIndexRequest } from '../requests/book-index.request';
import { BookUpdateRequest } from '../requests/book-update.request';
import { BookIndexResponse } from '../responses/book-index.response';
import { BookResponse } from '../responses/book.response';

@Controller('me/parties')
export class BookController {
    constructor(
        private readonly bookCRUDApplication: BookCRUDApplication,
        private readonly bookIndexApplication: BookIndexApplication,
    ) {}

    @Get(':id')
    async index(
        @Query() query: BookIndexRequest,
    ): Promise<IApiResponse<BookIndexResponse[]>> {
        const { data, meta } = await this.bookIndexApplication.fetch(query);

        const response = data.map((datum) => {
            return BookIndexResponse.mapFromPartyModel(datum);
        });

        return {
            message: 'Success fetch user',
            data: response,
            meta: meta,
        };
    }

    @Get(':id')
    async show(@Param('id') id: number): Promise<IApiResponse<BookResponse>> {
        const book = await this.bookCRUDApplication.detail(id);

        return {
            message: 'Success fetch user',
            data: book,
        };
    }

    @Delete(':id')
    async destroy(
        @Param('id') id: number,
    ): Promise<IApiResponse<BookResponse>> {
        await this.bookCRUDApplication.delete(id);

        return {
            message: 'Success fetch user',
            data: null,
        };
    }

    @Post()
    async store(
        @Body() bookRequest: BookCreateRequest,
    ): Promise<IApiResponse<BookResponse>> {
        await this.bookCRUDApplication.create(bookRequest);

        return {
            message: 'Success fetch user',
            data: null,
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() bookRequest: BookUpdateRequest,
    ): Promise<IApiResponse<BookResponse>> {
        await this.bookCRUDApplication.update(id, bookRequest);

        return {
            message: 'Success fetch user',
            data: null,
        };
    }
}
