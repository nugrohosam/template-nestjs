import {
    Controller,
    Get,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IApiResponse } from 'src/common/interface/response.interface';
import { config } from 'src/config';

@Controller()
export class UploadController {
    @Post('upload')
    @UseInterceptors(
        // need to separate this to reusable file
        FileInterceptor('file', {
            storage: diskStorage({
                destination: config.storage.path,
                filename: (req, file, callback) => {
                    const fileExtName = extname(file.originalname);
                    const randomName = new Date().getTime().toString();
                    callback(null, `${randomName}${fileExtName}`);
                },
            }),
        }),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IApiResponse<{ path: string }>> {
        return {
            message: 'File uploaded',
            data: {
                path: file.filename,
            },
        };
    }

    @Get('storage/:path')
    get(@Param('path') path: string, @Res() res: Response): void {
        return res.sendFile(path, { root: config.storage.path });
    }
}
