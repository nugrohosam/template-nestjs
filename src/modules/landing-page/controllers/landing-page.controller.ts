import { Controller, Get } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexLandingPageItemResponse } from '../responses/index-landing-page-items.response';
import { LandingPageService } from '../services/landing-page.service';

@Controller('landing-page-items')
export class LandingPageController {
    constructor(private readonly landingPageService: LandingPageService) {}

    @Get()
    async indexByUser(): Promise<IApiResponse<IndexLandingPageItemResponse[]>> {
        const data = await this.landingPageService.getLandingPageContent();

        const response = data.map((datum) => {
            return IndexLandingPageItemResponse.mapFromLandingPageContentModel(
                datum,
            );
        });

        return {
            message: 'Success fetch landing page items.',
            data: response,
        };
    }
}
