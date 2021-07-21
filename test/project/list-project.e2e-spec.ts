import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/list-project/list-success.json';
import schemaFailed from './resources/list-project/list-failed.json';

const validateJsonSchema = new Validator();
describe('Project List Test (GET)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            partyId: process.env.PARTY_ID, // todo: id bikin dinamis
        };
    });

    it('success get list project', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/projects/')
            .send(bodyRequest)
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

    it('failed get list project', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/projects/')
            .send(bodyRequest)
            .expect(403)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaFailed,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });
});
