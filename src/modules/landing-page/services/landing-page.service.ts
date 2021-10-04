import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LandingPageContentModel } from 'src/models/landing-page-content.model';
import { Repository } from 'typeorm';

@Injectable()
export class LandingPageService {
    constructor(
        @InjectRepository(LandingPageContentModel)
        private readonly repository: Repository<LandingPageContentModel>,
    ) {}

    async getLandingPageContent(): Promise<LandingPageContentModel[]> {
        return this.repository.find();
    }
}
