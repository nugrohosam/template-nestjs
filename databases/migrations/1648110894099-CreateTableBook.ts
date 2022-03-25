import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableBook1648110894099 implements MigrationInterface {
    name = 'CreateTableBook1648110894099';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`templatenest\`.\`books\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`templatenest\`.\`books\``);
    }
}
