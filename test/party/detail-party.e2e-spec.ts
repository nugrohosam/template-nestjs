import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/detail-party/details-success.json';
import schemaFailed from './resources/detail-party/details-failed.json';
import schemaPrivate from './resources/detail-party/details-private.json';

const validateJsonSchema = new Validator();

describe('Party Detail Test (GET)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success details party', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties/' + process.env.PARTY_ID) // todo: id party dibuat dinamis, ambil dari list party
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

    it('failed details party', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties/1111-1111-1111')
            .set('Content-Type', 'application/json')
            .expect(404)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaFailed,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });

    it('private details party', (done) => {
        return supertest(process.env.LOCALHOST)
            .get('/parties/' + process.env.PARTY_ID) // todo: id party dibuat dinamis, ambil dari list party
            .set('Content-Type', 'application/json')
            .expect(403)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaPrivate,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });
});
