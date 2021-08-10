import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexPartyTransactionRequest extends IndexRequest {
    @IsOptional()
    @IsEthereumAddress()
    @Expose({ name: 'member_address' })
    memberAddress: string;
}
