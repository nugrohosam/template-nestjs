import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePartiesTable1630557818549 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'parties',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                        isNullable: true,
                        isUnique: true,
                    },
                    { name: 'name', type: 'varchar' },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: [
                            PartyTypeEnum.Monarchy,
                            PartyTypeEnum.Democracy,
                            PartyTypeEnum.WeightedDemocracy,
                            PartyTypeEnum.Republic,
                        ],
                    },
                    { name: 'purpose', type: 'varchar' },
                    { name: 'image_url', type: 'varchar', isNullable: true },
                    {
                        name: 'creator_id',
                        type: 'varchar(36)',
                        isNullable: true,
                    },
                    {
                        name: 'owner_id',
                        type: 'varchar(36)',
                        isNullable: true,
                    },
                    { name: 'is_public', type: 'boolean' },
                    {
                        name: 'is_featured',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'total_fund',
                        type: 'bigint',
                        default: 0,
                    },
                    {
                        name: 'min_deposit',
                        type: 'bigint',
                        default: 0,
                    },
                    {
                        name: 'max_deposit',
                        type: 'bigint',
                        default: 0,
                    },
                    {
                        name: 'total_deposit',
                        type: 'bigint',
                        default: 0,
                    },
                    {
                        name: 'total_member',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'distribution',
                        type: 'enum',
                        enum: [
                            DistributionTypeEnum.Daily,
                            DistributionTypeEnum.Weekly,
                            DistributionTypeEnum.Monthly,
                            DistributionTypeEnum.Yearly,
                        ],
                    },
                    {
                        name: 'signature',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                        isNullable: true,
                        isUnique: true,
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
                        name: 'parties_creator_id_users_id_foreign',
                        columnNames: ['creator_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'users',
                        onDelete: 'set null',
                    },
                    {
                        name: 'parties_owner_id_users_id_foreign',
                        columnNames: ['owner_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'users',
                        onDelete: 'set null',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(
            'parties',
            'parties_owner_id_users_id_foreign',
        );
        await queryRunner.dropForeignKey(
            'parties',
            'parties_creator_id_users_id_foreign',
        );
        await queryRunner.dropTable('parties');
    }
}
