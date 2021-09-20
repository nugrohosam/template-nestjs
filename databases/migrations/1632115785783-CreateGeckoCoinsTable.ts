import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGeckoCoinsTable1632115785783 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'gecko_coins',
                columns: [
                    { name: 'id', type: 'varchar', isPrimary: true },
                    { name: 'symbol', type: 'varchar' },
                    { name: 'name', type: 'varchar' },
                ],
            }),
        );

        await queryRunner.query(
            'ALTER TABLE gecko_coins CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('gecko_coins');
    }
}
