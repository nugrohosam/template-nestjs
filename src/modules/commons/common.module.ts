import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { UserModel } from 'src/models/user.model';
import { GeckoCoinController } from './controllers/gecko-coin.controller';
import { UploadController } from './controllers/upload.controller';
import { GeckoCoinService } from './providers/gecko-coin.service';
import { GeneratePlatformSignature } from './providers/generate-platform-signature.service';
import { GenerateSignatureMessage } from './providers/generate-signature-message.service';
import { GetSignerService } from './providers/get-signer.service';
import { WSService } from './providers/websocket.service';

@Module({
    imports: [
        Web3Module,
        TypeOrmModule.forFeature([UserModel, GeckoCoinModel]),
    ],
    controllers: [UploadController, GeckoCoinController],
    providers: [
        GetSignerService,
        WSService,
        GeckoCoinService,
        GeneratePlatformSignature,
        GenerateSignatureMessage,
    ],
    exports: [
        GetSignerService,
        WSService,
        GeckoCoinService,
        GeneratePlatformSignature,
        GenerateSignatureMessage,
    ],
})
export class CommonModule {}
