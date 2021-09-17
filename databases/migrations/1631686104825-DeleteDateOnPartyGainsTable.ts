import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DeleteDateOnPartyGainsTable1631686104825
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('party_gains', 'date');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'party_gains',
            new TableColumn({ name: 'date', type: 'date' }),
        );
    }
}
