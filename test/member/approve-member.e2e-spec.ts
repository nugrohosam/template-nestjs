import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/approve-member/approve-success.json';

const validateJsonSchema = new Validator();

describe('Approve Member Test (PUT)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success approve member', (done) => {
        return supertest(process.env.LOCALHOST)
            .put('/member/' + process.env.PARTY_ID + '/approve')
            .set('Content-Type', 'application/json')
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
