import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnGeckoTokenIdOnCurrencies1640156917528
    implements MigrationInterface
{
    name = 'AddColumnGeckoTokenIdOnCurrencies1640156917528';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'currencies',
            new TableColumn({
                name: 'gecko_token_id',
                type: 'varchar(100)',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('currencies', 'gecko_token_id');
    }
}
