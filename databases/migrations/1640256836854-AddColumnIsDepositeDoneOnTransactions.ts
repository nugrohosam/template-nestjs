import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnIsDepositeDoneOnTransactions1640256836854
    implements MigrationInterface
{
    name = 'AddColumnIsDepositeDoneOnTransactions1640256836854';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'transactions',
            new TableColumn({
                name: 'is_deposite_done',
                type: 'boolean',
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('transactions', 'is_deposite_done');
    }
}
