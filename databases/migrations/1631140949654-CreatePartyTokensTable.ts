import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePartyTokensTable1631140949654 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'party_tokens',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    { name: 'party_id', type: 'varchar(36)' },
                    { name: 'symbol', type: 'varchar(10)' },
                    { name: 'address', type: 'varchar' },
                    { name: 'balance', type: 'bigint', default: 0 },
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
                        name: 'party_tokens_party_id_parties_id_foreign',
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
        await queryRunner.dropTable('party_tokens');
    }
}
