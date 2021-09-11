import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import WebSocket from 'ws';

@Injectable()
export class WSService {
    // wss://echo.websocket.org is a test websocket server
    private ws: WebSocket;
    private listEventHandler: Record<string, (any) => void> = {};
    constructor() {
        console.log(
            'WS SERVICE INITIATED  ---> ',
            config.web3.websocketProvider,
        );
        this.ws = new WebSocket(config.web3.websocketProvider);
        this.ws.on('message', (message) => {
            this.onMessage(message);
        });
        this.ws.on('error', (err) => console.log('err', err));
        this.ws.on('open', () => {
            Object.keys(this.listEventHandler).forEach((key) => {
                console.log('key', key);
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

    onMessage(message: WebSocket.Data) {
        const obj = JSON.parse(message.toString());
        if (obj.params) {
            this.listEventHandler[obj.params.result.topics[0]](
                obj.params.result,
            );
        }
    }
    registerHandler(topic, handler) {
        this.listEventHandler[topic] = handler;
        console.log('this.listEventHandler', this.listEventHandler);
    }
}
