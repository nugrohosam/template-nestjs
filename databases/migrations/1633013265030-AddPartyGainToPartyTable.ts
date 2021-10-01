import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPartyGainToPartyTable1633013265030
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'parties',
            new TableColumn({
                name: 'gain',
                type: 'json',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('parties', 'gain');
    }
}
