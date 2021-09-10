import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1630556139007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'address', type: 'varchar', isUnique: true },
                    { name: 'username', type: 'varchar', isNullable: true },
                    { name: 'firstname', type: 'varchar', isNullable: true },
                    { name: 'lastname', type: 'varchar', isNullable: true },
                    { name: 'image_url', type: 'text', isNullable: true },
                    { name: 'location', type: 'varchar', isNullable: true },
                    { name: 'email', type: 'varchar', isNullable: true },
                    { name: 'about', type: 'text', isNullable: true },
                    { name: 'website', type: 'varchar', isNullable: true },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        isNullable: true,
                        default: 'current_timestamp()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        isNullable: true,
                        default: 'current_timestamp()',
                        onUpdate: 'current_timestamp()',
                    },
                    { name: 'deleted_at', type: 'timestamp', isNullable: true },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
