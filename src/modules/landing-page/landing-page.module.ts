import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingPageContentModel } from 'src/models/landing-page-content.model';
import { LandingPageController } from './controllers/landing-page.controller';
import { LandingPageService } from './services/landing-page.service';

@Module({
    imports: [TypeOrmModule.forFeature([LandingPageContentModel])],
    controllers: [LandingPageController],
    providers: [LandingPageService],
})
export class LandingPageModule {}
