import { Transform } from 'class-transformer';
import { IsEthereumAddress, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexTransactionRequest extends IndexRequest {
    @IsOptional()
    @IsEthereumAddress()
    @Transform(({ value }) => value.toLowerCase())
    from?: string;

    @IsOptional()
    @IsEthereumAddress()
    @Transform(({ value }) => value.toLowerCase())
    to?: string;
}
