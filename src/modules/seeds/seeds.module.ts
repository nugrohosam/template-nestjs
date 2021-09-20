import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionOption } from 'src/infrastructure/databases';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { GeckoCoinSeeder } from './providers/gecko-coin.seeder';

@Module({
    imports: [
        TypeOrmModule.forRoot(connectionOption),
        TypeOrmModule.forFeature([GeckoCoinModel]),
    ],
    providers: [GeckoCoinSeeder],
})
export class SeedsModule {}
