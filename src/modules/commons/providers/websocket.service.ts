import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { config } from 'src/config';
import WebSocket from 'ws';

@Injectable()
export class WSService {
    // wss://echo.websocket.org is a test websocket server
    private ws: WebSocket;
    private listEventHandler: Record<string, (arg0: any) => Promise<void>> = {};

    constructor() {
        this.ws = new WebSocket(config.web3.websocketProvider);
        this.ws.on('message', (message) => {
            this.onMessage(message);
        });
        this.ws.on('error', (err) => {
            console.log('=> WebSocket Error:');
            console.log(err);
        });
        this.ws.on('open', () => {
            Object.keys(this.listEventHandler).forEach((key) => {
                console.log('register topic:', key);
                this.send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_subscribe',
                    params: ['logs', { topics: [key] }],
                });
            });
            this.ping();
        });
        this.ws.on('pong', (data: Buffer) => {
            console.log('=> WebSocket Pong: ' + data.toString());
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    send(data: Object): void {
        this.ws.send(JSON.stringify(data));
    }

    async onMessage(message: WebSocket.Data): Promise<void> {
        const obj = JSON.parse(message.toString());
        if (obj.params) {
            await this.listEventHandler[obj.params.result.topics[0]](
                obj.params,
            );
        }
    }

    registerHandler(
        topic: string,
        handler: (arg0: any) => Promise<void>,
    ): void {
        this.listEventHandler[topic] = handler;
    }

    @Cron('0 0,30 * * * *')
    ping(): void {
        const topics = Object.keys(this.listEventHandler);
        this.ws.ping(`${topics.length} topics registered on ${this.ws.url}`);
    }
}
