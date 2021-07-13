import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schema from './resources/detail-user/detail-success.json';

const validateJsonSchema = new Validator();
describe('Detail User Test (GET)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success get detail', (done) => {
        return supertest(app.getHttpServer())
            .get('/profile/0xF8ed25616EC89B78fe281EB3C2075B14295C70b8')
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
