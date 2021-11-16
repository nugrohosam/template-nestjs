import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUsdOnSwapTransaction1637038801684
    implements MigrationInterface
{
    name = 'AddUsdOnSwapTransaction1637038801684';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'swap_transactions',
            new TableColumn({
                name: 'usd',
                type: 'bigint',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('swap_transactions', 'usd');
    }
}
