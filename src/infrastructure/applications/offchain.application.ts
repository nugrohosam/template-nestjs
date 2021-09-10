/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * Used to handle offchain transaction that not relate on SC
 */
export abstract class OffchainApplication {
    abstract call(arg0: any, arg1: any, arg2: any): Promise<any>;
}
