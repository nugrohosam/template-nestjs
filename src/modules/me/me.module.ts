import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MePartiesController } from './controllers/example.controller';
import { TransactionSyncSchedulerService } from './scheduler/transaction-sync-scheduler.service';
import { MeService } from './services/me.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
    ],
    controllers: [MePartiesController],
    providers: [
        //Scheduler
        TransactionSyncSchedulerService,

        MeService,
    ],
    exports: [
        // for application here
    ],
})
export class MeModule {}
