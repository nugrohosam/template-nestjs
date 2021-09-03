import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePartyMembersTable1630566791630
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'party_members',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'party_id', type: 'varchar(36)' },
                    { name: 'member_id', type: 'varchar(36)' },
                    { name: 'initial_fund', type: 'bigint', default: 0 },
                    { name: 'total_deposit', type: 'bigint', default: 0 },
                    { name: 'total_fund', type: 'bigint', default: 0 },
                    { name: 'weight', type: 'int', default: 0 },
                    { name: 'signature', type: 'varchar' },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'deposit_transaction_id',
                        type: 'varchar(36)',
                        isNullable: true,
                    },
                    {
                        name: 'leave_transaction_hash',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
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
                        name: 'party_members_party_id_parties_id_foreign',
                        columnNames: ['party_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'parties',
                        onDelete: 'cascade',
                    },
                    {
                        name: 'party_members_member_id_users_id_foreign',
                        columnNames: ['member_id'],
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
            'party_members',
            'party_members_member_id_users_id_foreign',
        );
        await queryRunner.dropForeignKey(
            'party_members',
            'party_members_party_id_parties_id_foreign',
        );
        await queryRunner.dropTable('party_members');
    }
}
