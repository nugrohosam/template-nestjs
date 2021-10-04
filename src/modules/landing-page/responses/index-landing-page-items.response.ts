import { LandingPageContentKeyEnum } from 'src/common/enums/landing-page-content.enum';
import { ILandingPageContent } from 'src/entities/landing-page-content.entity';
import { LandingPageContentModel } from 'src/models/landing-page-content.model';

export class IndexLandingPageItemResponse
    implements Omit<ILandingPageContent, 'deleted_at'>
{
    id: string;
    key: LandingPageContentKeyEnum;
    value: string;
    createdAt: Date;
    updatedAt: Date;

    static mapFromLandingPageContentModel(
        model: LandingPageContentModel,
    ): IndexLandingPageItemResponse {
        return {
            id: model.id,
            key: model.key,
            value: model.value,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    }
}
