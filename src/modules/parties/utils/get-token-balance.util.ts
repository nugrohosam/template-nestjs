import web3 from 'web3';
import { Erc20AbiItem } from 'src/contracts/ERC20';
import { ContractSendMethod } from 'web3-eth-contract';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GetTokenBalanceService {
    constructor(private readonly web3Service: Web3Service) {}
    getTokenBalance = async (
        addressToken: string,
        tokenName: string,
        address: string,
    ): Promise<{
        balance: string;
        decimal: string;
        name: string;
    }> => {
        const erc20Token = this.web3Service.getContractInstance(
            Erc20AbiItem,
            addressToken,
        );
        Logger.debug(erc20Token, 'erc20Token => ');
        const balanceOf = erc20Token.methods.balanceOf(
            address,
        ) as ContractSendMethod;
        Logger.debug(balanceOf, 'balanceOf => ');
        const decimal = erc20Token.methods.decimals() as ContractSendMethod;
        Logger.debug(decimal, 'decimal => ');
        const result: [string, string] = await Promise.all([
            balanceOf.call(),
            decimal.call(),
        ]);
        Logger.log(result, 'result => ');
        return {
            balance: result[0],
            decimal: result[1],
            name: tokenName,
        };
    };

    formatFromWeiToken = (balance: string, decimal: number) => {
        const weiValue = web3.utils.fromWei(balance);
        return Number(weiValue) * 10 ** (18 - decimal);
    };
}
