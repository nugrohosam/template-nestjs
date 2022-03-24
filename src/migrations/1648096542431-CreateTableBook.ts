import { MigrationInterface, QueryRunner, Table } from 'typeorm';
export class ArticleTable1586653096209 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(
            new Table({
                name: 'books',
                columns: [
                    {
                        name: 'id',
                        type: 'int4',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'content',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            false,
        );
    }
    public async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`DROP TABLE article`);
    }
}
