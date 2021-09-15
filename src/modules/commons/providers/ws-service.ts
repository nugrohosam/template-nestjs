import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import WebSocket from 'ws';

@Injectable()
export class WSService {
    // wss://echo.websocket.org is a test websocket server
    private ws: WebSocket;
    private listEventHandler: Record<string, (any) => void> = {};
    constructor() {
        this.ws = new WebSocket(config.web3.websocketProvider);
        this.ws.on('message', (message) => {
            this.onMessage(message);
        });
        this.ws.on('error', (err) => console.log('err', err));
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
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    send(data: Object) {
        this.ws.send(JSON.stringify(data));
    }

    async onMessage(message: WebSocket.Data) {
        const obj = JSON.parse(message.toString());
        if (obj.params) {
            await this.listEventHandler[obj.params.result.topics[0]](
                obj.params,
            );
        }
    }
    registerHandler(topic, handler) {
        this.listEventHandler[topic] = handler;
    }
}
