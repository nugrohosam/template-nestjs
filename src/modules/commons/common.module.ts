import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { UploadController } from './controllers/upload.controller';
import { GetSignerService } from './providers/get-signer.service';

@Module({
    imports: [Web3Module],
    controllers: [UploadController],
    providers: [GetSignerService],
    exports: [GetSignerService],
})
export class CommonModule {}
