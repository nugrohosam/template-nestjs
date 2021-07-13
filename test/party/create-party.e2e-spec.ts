import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schema from './resources/create-party/create-success.json';

const validateJsonSchema = new Validator();

describe('Party Test (POST)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('success create party', (done) => {
        return supertest(app.getHttpServer())
            .post('/parties/create')
            .set('Content-Type', 'application/json')
            .send({
                name: 'nice',
                type: 'monarchy',
                purpose: 'yield_farming',
                is_public: 0,
                min_deposit: 1,
                max_deposit: 3,
                distribution: 'monthly',
                member_address: '0x642307c5E87b6701C47586F6101Ce7F235F1F1cb',
                member_signature:
                    '0x848a851105906c3d6d63361751c180d3d2b6b58eb61ba97c5cda77815ec65df4446d4ab73019a2d49ad5ab71f881c15a288d4b3d6d4952d3728e98b97dc052b41c',
            })
            .expect(201)
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
