import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export class CreateTransactionVolumeTable1640572775642
    implements MigrationInterface
{
    name = 'CreateTransactionVolumeTable1640572775642';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'transaction_volume',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'party_id', type: 'varchar(36)' },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: [
                            TransactionTypeEnum.Withdraw,
                            TransactionTypeEnum.Deposit,
                            TransactionTypeEnum.Charge,
                            TransactionTypeEnum.Distribution,
                            TransactionTypeEnum.Swap,
                        ],
                    },
                    { name: 'amount_usd', type: 'varchar(255)' },
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
                        name: 'transaction_sync_party_id_parties_id_foreign',
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
        await queryRunner.dropForeignKey(
            'transaction_volume',
            'transaction_sync_party_id_parties_id_foreign',
        );
        await queryRunner.dropTable('transaction_volume');
    }
}
