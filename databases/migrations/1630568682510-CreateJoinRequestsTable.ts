import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJoinRequestsTable1630568682510
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'join_requests',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'user_id', type: 'varchar(36)' },
                    { name: 'party_id', type: 'varchar(36)' },
                    { name: 'processed_by', type: 'varchar(36)' },
                    {
                        name: 'accepted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'rejeceted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
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
                foreignKeys: [
                    {
                        name: 'join_requests_user_id_users_id_foreign',
                        columnNames: ['user_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'users',
                        onDelete: 'cascade',
                    },
                    {
                        name: 'join_requests_party_id_parties_id_foreign',
                        columnNames: ['party_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'parties',
                        onDelete: 'cascade',
                    },
                    {
                        name: 'join_requests_processed_by_parties_id_foreign',
                        columnNames: ['processed_by'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'users',
                        onDelete: 'cascade',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'join_requests',
            'join_requests_processed_by_parties_id_foreign',
        );
        await queryRunner.dropForeignKey(
            'join_requests',
            'join_requests_party_id_parties_id_foreign',
        );
        await queryRunner.dropForeignKey(
            'join_requests',
            'join_requests_user_id_users_id_foreign',
        );

        await queryRunner.dropTable('join_requests');
    }
}
