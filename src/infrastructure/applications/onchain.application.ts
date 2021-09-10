/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Return type of Onchain Series transaction
 * It will be used by SC to do their things
 */
export type PrepareOnchainReturn<T = any> = {
    data: T;
    platformSignature: string;
};

/**
 * Used to handle Onchain Paralel Transaction with flow
 * FE -> SC -> FE -> BE
 *
 * The "commit" method will called twice by FE:
 * - Transaction hash initiated or transaction created on network
 * - Transaction has mined with status eather true or false
 */
export abstract class OnchainParalelApplication {
    abstract commit(arg0: any, arg1: any, arg2: any): Promise<any>;
    abstract revert(arg0: any, arg1: any): Promise<void>;
}

/**
 * Used to handle Onchain Series Transaction with flow
 * FE -> BE -> FE -> SC -> FE -> BE
 *
 * The "commit" method will called twice by FE:
 * - Transaction hash initiated or transaction created on network
 * - Transaction has mined with status eather true or false
 */
export abstract class OnchainSeriesApplication {
    abstract prepare(
        arg0: any,
        arg1: any,
        arg2: any,
    ): Promise<PrepareOnchainReturn>;
    abstract commit(arg0: any, arg1: any): Promise<any>;
    abstract revert(arg0: any, arg1: any): Promise<void>;
}
