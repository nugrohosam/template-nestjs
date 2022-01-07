import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsClosedOnParty1639016198725 implements MigrationInterface {
    name = 'AddIsClosedOnParty1639016198725';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'parties',
            new TableColumn({
                name: 'is_closed',
                type: 'boolean',
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('parties', 'is_closed');
    }
}
