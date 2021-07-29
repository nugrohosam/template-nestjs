import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/invite-user/invite-success.json';

const validateJsonSchema = new Validator();

describe('Invite User to Party Test (POST)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            user_address: process.env.USER_ADDRESS,
            invite_signature:
                '0xf25473e87b9e8a040b655f992a4105f40a17bf9af08a39488798e01b57ae5d2e1a68bfacf5171a37a7904d34e02b3c722aef8cbb8aee61f84962c0a6c1afbd661c',
        };
    });

    it('success invite user to party', (done) => {
        return supertest(process.env.LOCALHOST)
            .post('/parties/' + process.env.PARTY_ID + '/invitations')
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
});
