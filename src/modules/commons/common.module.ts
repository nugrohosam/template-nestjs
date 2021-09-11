import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { UserModel } from 'src/models/user.model';
import { UploadController } from './controllers/upload.controller';
import { GetSignerService } from './providers/get-signer.service';
import { WSService } from './providers/ws-service';

@Module({
    imports: [Web3Module, TypeOrmModule.forFeature([UserModel])],
    controllers: [UploadController],
    providers: [GetSignerService, WSService],
    exports: [GetSignerService, WSService],
})
export class CommonModule {}
