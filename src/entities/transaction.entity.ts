export interface ITransaction {
    id?: string;
    addressFrom: string;
    addressTo: string;
    amount: bigint;
    currencyId: number;
    type: string;
    description: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}
