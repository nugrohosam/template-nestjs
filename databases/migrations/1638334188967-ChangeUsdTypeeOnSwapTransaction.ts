import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeUsdTypeeOnSwapTransaction1638334188967
    implements MigrationInterface
{
    name = 'ChangeUsdTypeeOnSwapTransaction1638334188967';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'swap_transactions',
            'usd',
            new TableColumn({
                name: 'usd',
                type: 'decimal',
                precision: 10,
                scale: 6,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'swap_transactions',
            'usd',
            new TableColumn({
                name: 'usd',
                type: 'bigint',
            }),
        );
    }
}
