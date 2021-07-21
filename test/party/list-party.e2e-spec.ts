import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/list-party/list-success.json';

const validateJsonSchema = new Validator();

describe('Party List Test (GET)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success list party', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties')
            .set('Content-Type', 'application/json')
            .query({per_page:10,page:1,owner_id:process.env.OWNER_ID}) // todo: owner id buat dinamis, ambil detail user
            .expect(200)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaSuccess,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });
});
