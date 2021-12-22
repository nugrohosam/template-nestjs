import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnGeckoTokenIdOnPartyTokens1640154801506
    implements MigrationInterface
{
    name = 'AddColumnGeckoTokenIdOnPartyTokens1640154801506';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'party_tokens',
            new TableColumn({
                name: 'gecko_token_id',
                type: 'varchar(100)',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('party_tokens', 'gecko_token_id');
    }
}
