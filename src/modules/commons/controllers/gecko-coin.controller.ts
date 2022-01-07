import { Controller, Get, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { GeckoCoinService } from '../providers/gecko-coin.service';
import { GeckoCoinRequest } from '../requests/gecko-coin.request';

@Controller('gecko-coins')
export class GeckoCoinController {
    constructor(private readonly geckoCoinService: GeckoCoinService) {}

    @Get()
    async index(
        @Query() { ids }: GeckoCoinRequest,
    ): Promise<IApiResponse<GeckoCoinModel[]>> {
        const coins = await this.geckoCoinService.getGeckoCoins(
            ids.map((v) => v.toLowerCase()),
        );
        return {
            message: 'Success get list from gecko',
            data: coins,
        };
    }
}
