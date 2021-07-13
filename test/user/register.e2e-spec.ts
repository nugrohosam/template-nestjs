import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/register-user/register-success.json';
import schemaFailed from './resources/register-user/register-failed.json';

const validateJsonSchema = new Validator();

describe('Register Test (POST)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            token_address: '0xF8ed25616EC89B78fe281EB3C2075B14295C70b8',
            signature:
                '0x8c3786fdb00dc585d278516c0bad4b82e885d856e644949c5d87cf0b4dcb089c44567ce64389374d86078c44c1f26b2ca1f6ee15089e9686aa54f3542ec6d5e81c',
        };
    });

    it('success register', (done) => {
        return supertest("localhost:3000")
            .post('/register')
            .set('Content-Type', 'application/json')
            .send(bodyRequest)
            .expect(201)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaSuccess,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });

    it('failed register', (done) => {
        return supertest("localhost:3000")
            .post('/register')
            .set('Content-Type', 'application/json')
            .send(bodyRequest)
            .expect(422)
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
