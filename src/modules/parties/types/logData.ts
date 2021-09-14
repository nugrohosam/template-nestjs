interface ILogParams {
    subscription: string;
    result: {
        address: string;
        blockHash: string;
        blockNumber: string;
        data: string;
        logIndex: string;
        topics: string[];
        transactionHash: string;
        transactionIndex: string;
    };
}

export interface IEventLogData {
    jsonrpc: string;
    method: string;
    params?: ILogParams;
    result?: string;
}
