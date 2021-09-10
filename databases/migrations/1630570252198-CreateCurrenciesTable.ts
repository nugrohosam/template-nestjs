import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCurrenciesTable1630570252198 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'currencies',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        unsigned: true,
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'symbol', type: 'varchar' },
                    { name: 'description', type: 'text', isNullable: true },
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
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('currencies');
    }
}
