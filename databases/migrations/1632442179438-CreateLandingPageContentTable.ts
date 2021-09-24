import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLandingPageContentTable1632442179438
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'landing_page_contents',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'key',
                        type: 'enum',
                        enum: ['youtube_video'],
                        isUnique: true,
                    },
                    {
                        name: 'value',
                        type: 'varchar(255)',
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
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('landing_page_contents');
    }
}
