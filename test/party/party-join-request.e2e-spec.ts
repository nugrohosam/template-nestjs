import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/party-join-request/party-join-request-success.json';

const validateJsonSchema = new Validator();

describe('Party Join Request Test (GET)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success party join request', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties/' + process.env.PARTY_ID + 'join-request')
            .set('Content-Type', 'application/json')
            .query({ per_page: 10 })
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
