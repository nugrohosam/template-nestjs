import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSellAndBuyAmountSwapTransaction1639563370554
    implements MigrationInterface
{
    name = 'ChangeSellAndBuyAmountSwapTransaction1639563370554';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE swap_transactions MODIFY COLUMN buy_amount varchar(255) NOT NULL;',
        );
        await queryRunner.query(
            'ALTER TABLE swap_transactions MODIFY COLUMN sell_amount varchar(255) NOT NULL;',
        );
        await queryRunner.query(
            'ALTER TABLE swap_transactions MODIFY COLUMN usd varchar(255) NOT NULL;',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE swap_transactions MODIFY COLUMN buy_amount bigint(20) NOT NULL;',
        );
        await queryRunner.query(
            'ALTER TABLE swap_transactions MODIFY COLUMN sell_amount bigint(20) NOT NULL;',
        );
        await queryRunner.query(
            'ALTER TABLE kaget.swap_transactions MODIFY COLUMN usd decimal(10,6) NOT NULL;',
        );
    }
}
