import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schema from './resources/list-success.json';

const validateJsonSchema = new Validator();

describe('Party List Test (GET)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        bodyRequest = {
            per_page: 10,
            page: 1,
            owner_id:'1a160d9c-eba6-440e-803a-d9cee909ad50',
        };
    });

    it('success list party', (done) => {
        return supertest("localhost:3000")
            .get('/parties')
            .set('Content-Type', 'application/json')
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
