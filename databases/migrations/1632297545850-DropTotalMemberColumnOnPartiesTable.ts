import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropTotalMemberColumnOnPartiesTable1632297545850
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('parties', 'total_member');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'parties',
            new TableColumn({
                name: 'total_member',
                type: 'int',
                default: 0,
            }),
        );
    }
}
