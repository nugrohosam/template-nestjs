import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/update-user/update-success.json';

const validateJsonSchema = new Validator();

describe('Update Profile Test (PUT)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            username: 'jimbeglin',
            name: 'Sir Jim Beglin',
            image_url: 'http://polkaparty.io/media/profile/ec9476c9347cb432134a9e81776dsacsx',
            about: 'Simple ruthless. Hello John, hello everyone',
            website: 'https://callmejim.me/about',
        };
    });

    it('success update profile', (done) => {
        return supertest("localhost:3000")
            .put('/profile')
            .set('Content-Type', 'application/json')
            .send(bodyRequest)
            .expect(204)
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
