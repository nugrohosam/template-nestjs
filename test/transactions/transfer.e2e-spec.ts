import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/transfer/transfer-success.json';

const validateJsonSchema = new Validator();

describe('Transfer Test (POST)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        bodyRequest = {
            from_address: '0xC3f289326CC63ca40e17deecA65553F36b047f6D',
            to_address: '0xeA23f96a58850d375d43873A572df9C71e14eF52',
            amount: 5000000000,
            currency_id: process.env.CURRENCY_ID,
            type: 'deposit',
            description: 'Initial deposit',
            transaction_hash:
                '7d2f09078c82cefc2f63c55b3e19296a33e83e77d14d538368f8271a8ab1cd85',
            transfer_signature: 'adfadslfkadslfkajdsf',
        };
    });

    it('success transfer', (done) => {
        return supertest(process.env.LOCALHOST)
            .post('/transactions/transfer')
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
