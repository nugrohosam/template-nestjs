import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';

@Module({
    imports: [HttpModule, Web3Module],
})
export class SwapModule {}
