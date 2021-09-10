import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAddressToCurrenciesTable1631260805531
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'currencies',
            new TableColumn({
                name: 'address',
                type: 'varchar',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('currencies', 'address');
    }
}
