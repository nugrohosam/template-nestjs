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
                    { name: 'party_id', type: 'varchar(36)' },
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
                foreignKeys: [
                    {
                        name: 'swap_transaction_party_id_parties_id_foreign',
                        columnNames: ['party_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'parties',
                        onDelete: 'cascade',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('swap_transactions');
    }
}
