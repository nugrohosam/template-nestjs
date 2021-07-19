import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Validator } from 'jsonschema';
import schemaPublic from './resources/join-party/join-public.json';
import schemaPrivate from './resources/join-party/join-private.json';

const validateJsonSchema = new Validator();

describe('Join Party Test (POST)', () => {
    let app: INestApplication;
    let bodyRequest;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // todo: user_address pindahkan ke .env
        bodyRequest = {
            initial_deposit: 2,
            user_address: '0xf6d03bFCcC910B0575757aF934FC27e68e42ef4E',
            join_signature: '0x5b7895f17106653bc49495cf0665a9cdb2af5d3077e946970498c114be4192287fcdce76ba1aabdb38bed9e47173e9c99834a316ccba9e700154d26609636eda1c',
            transaction_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',

        };
    });

    it('success join public party', (done) => {
        // todo: localhost:3000 pindahkan ke .env
        return supertest('localhost:3000')
            .post('/parties/' + process.env.PARTY_ID + '/join')
            .set('Content-Type', 'application/json')
            .send(bodyRequest)
            .expect(201)
            .then((response) => {
                const validateResult = validateJsonSchema.validate(
                    response.body,
                    schemaPublic,
                );
                expect(validateResult.valid).toBe(true);
                done();
            });
    });

    it('success join private party', (done) => {
        return supertest('localhost:3000')
            .post('/parties/' + process.env.PARTY_ID + '/join')
            .set('Content-Type', 'application/json')
            .send(bodyRequest)
            .expect(201)
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
