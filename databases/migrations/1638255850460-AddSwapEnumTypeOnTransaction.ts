import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSwapEnumTypeOnTransaction1638255850460
    implements MigrationInterface
{
    name = 'AddSwapEnumTypeOnTransaction1638255850460';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'transactions',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: [
                    TransactionTypeEnum.Deposit,
                    TransactionTypeEnum.Withdraw,
                    TransactionTypeEnum.Distribution,
                ],
            }),
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: [
                    TransactionTypeEnum.Deposit,
                    TransactionTypeEnum.Withdraw,
                    TransactionTypeEnum.Distribution,
                    TransactionTypeEnum.Swap,
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'transactions',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: [
                    TransactionTypeEnum.Deposit,
                    TransactionTypeEnum.Withdraw,
                    TransactionTypeEnum.Distribution,
                    TransactionTypeEnum.Swap,
                ],
            }),
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
