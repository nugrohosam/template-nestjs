import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBioOnPartiesTable1635305335825 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'parties',
            new TableColumn({
                name: 'bio',
                type: 'text',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('parties', 'bio');
    }
}
