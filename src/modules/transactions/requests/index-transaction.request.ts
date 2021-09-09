import { IsEthereumAddress, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexTransactionRequest extends IndexRequest {
    @IsOptional()
    @IsEthereumAddress()
    from?: string;

    @IsOptional()
    @IsEthereumAddress()
    to?: string;
}
