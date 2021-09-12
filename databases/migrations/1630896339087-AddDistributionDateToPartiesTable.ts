import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDistributionDateToPartiesTable1630896339087
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'parties',
            new TableColumn({
                name: 'distribution_date',
                type: 'date',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('parties', 'distribution_date');
    }
}
