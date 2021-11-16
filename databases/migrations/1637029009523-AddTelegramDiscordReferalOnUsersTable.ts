import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTelegramDiscordReferalOnUsersTable1637029009523
    implements MigrationInterface
{
    name = 'AddTelegramDiscordReferalOnUsersTable1637029009523';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'telegram',
                type: 'varchar',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'discord',
                type: 'varchar',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'referal',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'telegram');
        await queryRunner.dropColumn('users', 'discord');
        await queryRunner.dropColumn('users', 'referal');
    }
}
