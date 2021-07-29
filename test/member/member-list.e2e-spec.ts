import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schema from './resources/member-list/list-success.json';

const validateJsonSchema = new Validator();
describe('Member List Test (GET)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            status: 'PENDING',
        };
    });

    it('success get member list', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties/' + process.env.PARTY_ID + '/members')
            .query({ per_page: 10, page: 1 })
            .send(bodyRequest)
            .expect(200)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schema,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });
});
