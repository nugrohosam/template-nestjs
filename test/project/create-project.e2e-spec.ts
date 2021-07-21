import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaSuccess from './resources/create-project/create-success.json';

const validateJsonSchema = new Validator();

describe('Create Project Test (POST)', () => {
    let app: INestApplication;
    let bodyRequest;
    let dateTime;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        dateTime = new Date();
        bodyRequest = {
            title: 'MakiSwap',
            description:
                'MakiSwap, part of the growing UniLayer ecosystem, is set to build a decentralized finance ecosystem together with a yield farming platform on the Huobi eco chain.\n' +
                'The automated market maker offers a robust trading experience for both professional and new investors using a variety of trading tools powered by Unilayer.\n' +
                'MakiSwap protocol is powered by the MAKI governance token, which is yet to be distributed in multiple public sales. Having raised a total of $1.4 million in private funding, the team behind MakiSwap will airdrop MAKI token on both the Binance Smart Chain and Ethereum.\n' +
                'On top of rewards earned from providing liquidity to the Defi project’s pools, MAKI tokens allow holders to earn additional income as a portion of the protocol’s fee. This additional income will be accumulated proportionally based on the amount of tokens that each user has staked against the total amount of LP tokens.\n',
            contract_address: '0x5FaD6fBBA4BbA686bA9B8052Cf0bd51699f38B93',
            attachment_url:
                'https://drive.google.com/file/d/11YIetPS0fLXvtNjVMVNZ6MAWk7ZsaAS/view',
            vote_start: dateTime.toLocaleString(), // todo: pakai date time today + 1 atau + 7
            vote_end: dateTime.setDate(dateTime.getDate() + 1), // todo: pakai date time today + 1 atau + 7
            project_start: dateTime.setDate(dateTime.getDate() + 1), // todo: pakai date time today + 1 atau + 7
            project_end: dateTime.setDate(dateTime.getDate() + 7), // todo: pakai date time today + 1 atau + 7
            amount: 50000000000000,
            currency_id: process.env.CURRENCY_ID, // todo: currency ID dari API
        };
    });

    it('success create project', (done) => {
        return supertest(process.env.LOCALHOST)
            .post('/projects/create')
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
