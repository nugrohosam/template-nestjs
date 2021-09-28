import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAnnounementTable1632797792334 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'announcements',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'party_id',
                        type: 'varchar(36)',
                    },
                    {
                        name: 'title',
                        type: 'varchar(255)',
                    },
                    {
                        name: 'body',
                        type: 'varchar(255)',
                    },
                    {
                        name: 'link',
                        type: 'varchar(255)',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'current_timestamp()',
                        isNullable: true,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'current_timestamp()',
                        onUpdate: 'current_timestamp()',
                        isNullable: true,
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        name: 'announcements_party_id_foreign',
                        columnNames: ['party_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'parties',
                        onDelete: 'cascade',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'announcements',
            'announcements_party_id_foreign',
        );
        await queryRunner.dropTable('announcements');
    }
}
