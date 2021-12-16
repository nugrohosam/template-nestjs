import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAmountTransactions1639564094359
    implements MigrationInterface
{
    name = 'ChangeAmountTransactions1639564094359';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE transactions MODIFY COLUMN amount varchar(255) NOT NULL;',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE transactions MODIFY COLUMN amount bigint(20) NOT NULL;',
        );
    }
}
