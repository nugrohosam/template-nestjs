import { Controller, Get, Headers, Inject } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { MePartiesService } from '../services/parties.service';

@Controller('me/parties')
export class MePartiesController {
    constructor(
        @Inject(GetSignerService)
        private readonly getSignerService: GetSignerService,
        @Inject(MePartiesService)
        private readonly mePartyService: MePartiesService,
    ) {}

    @Get()
    async index(
        @Headers('Signature') signature: string,
    ): Promise<IApiResponse<IndexPartyResponse[]>> {
        const signer = await this.getSignerService.get(signature, true);
        const { data, meta } = await this.mePartyService.fetch(signer);

        return {
            message: 'Success fetch user parties',
            data,
            meta,
        };
    }
}
