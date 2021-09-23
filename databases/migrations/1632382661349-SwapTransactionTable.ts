import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class SwapTransactionTable1632382661349 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'swap_transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'token_from', type: 'varchar' },
                    { name: 'token_target', type: 'varchar' },
                    { name: 'buy_amount', type: 'bigint' },
                    { name: 'sell_amount', type: 'bigint' },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        isNullable: true,
                        default: 'current_timestamp()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        isNullable: true,
                        default: 'current_timestamp()',
                        onUpdate: 'current_timestamp()',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('swap_transactions');
    }
}
