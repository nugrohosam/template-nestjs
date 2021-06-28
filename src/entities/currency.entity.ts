export interface ICurrency {
    id?: number;
    symbol: string;
    address: string;
    description?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}
