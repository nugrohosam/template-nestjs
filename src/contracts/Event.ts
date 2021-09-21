import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { AbiItem } from 'web3-utils';

export class ContractEvent {
    abi: AbiItem;

    get signature(): string {
        return new Web3Service().encodeEventSignature(this.abi);
    }

    constructor(abi: AbiItem) {
        this.abi = abi;
    }
}
