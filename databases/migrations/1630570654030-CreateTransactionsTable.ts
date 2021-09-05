import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTransactionsTable1630570654030
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'address_from', type: 'varchar' },
                    { name: 'address_to', type: 'varchar' },
                    { name: 'amount', type: 'bigint' },
                    {
                        name: 'currency_id',
                        type: 'int',
                        unsigned: true,
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: [
                            TransactionTypeEnum.Deposit,
                            TransactionTypeEnum.Withdraw,
                            TransactionTypeEnum.Distribution,
                        ],
                    },
                    { name: 'description', type: 'text', isNullable: true },
                    { name: 'signature', type: 'varchar' },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'transaction_hash_status',
                        type: 'boolean',
                        default: false,
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
                    { name: 'deleted_at', type: 'timestamp', isNullable: true },
                ],
                foreignKeys: [
                    {
                        name: 'transactions_currency_id_currencies_id_foreign',
                        columnNames: ['currency_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'currencies',
                        onDelete: 'set null',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('transactions');
    }
}
