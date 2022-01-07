import { PartyEvents } from 'src/contracts/Party';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTransactionSyncTable1639365029710
    implements MigrationInterface
{
    name = 'CreateTransactionSyncTable1639365029710';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'transaction_sync',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(36)',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'transaction_hash',
                        type: 'varchar',
                    },
                    {
                        name: 'event_name',
                        type: 'enum',
                        enum: [
                            PartyEvents.WithdrawEvent,
                            PartyEvents.WithdrawAllEvent,
                            PartyEvents.ClosePartyEvent,
                            PartyEvents.LeavePartyEvent,
                        ],
                    },
                    {
                        name: 'is_sync',
                        type: 'boolean',
                        default: false,
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
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('transaction_sync');
    }
}
