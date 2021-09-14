import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddChargeTypeToTransactionsTable1631597827203
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'transactions',
            'type',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: [
                    TransactionTypeEnum.Deposit,
                    TransactionTypeEnum.Withdraw,
                    TransactionTypeEnum.Distribution,
                    TransactionTypeEnum.Charge,
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'transactions',
            'type',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: [
                    TransactionTypeEnum.Deposit,
                    TransactionTypeEnum.Withdraw,
                    TransactionTypeEnum.Distribution,
                ],
            }),
        );
    }
}
