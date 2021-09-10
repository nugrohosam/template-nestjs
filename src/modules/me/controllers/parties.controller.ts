import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { MyPartiesApplication } from '../applications/my-parties.application';
import { IndexMePartyRequest } from '../requests/index-party.request';

@Controller('me/parties')
export class MePartiesController {
    constructor(
        @Inject(GetSignerService)
        private readonly getSignerService: GetSignerService,
        @Inject(MyPartiesApplication)
        private readonly myPartyApplication: MyPartiesApplication,
    ) {}

    @Get()
    async index(
        @Headers('Signature') signature: string,
        @Query() query: IndexMePartyRequest,
    ): Promise<IApiResponse<IndexPartyResponse[]>> {
        const { data, meta } = await this.myPartyApplication.fetch(
            query,
            signature,
        );

        const response = data.map((datum) => {
            return IndexPartyResponse.mapFromPartyModel(datum);
        });

        return {
            message: 'Success fetch user parties',
            data: response,
            meta,
        };
    }
}
