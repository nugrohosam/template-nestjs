import { Logger } from '@nestjs/common';
import { config } from 'src/config';
import WebSocket from 'ws';
import * as Sentry from '@sentry/node';

interface IWebSocketInstance {
    ws: WebSocket;
    address: string;
    topic: string;
    handler: (arg0: any) => Promise<void>;
}

class WebSocketService {
    private instances: IWebSocketInstance[];
    private readonly PingInterval = 60000;

    constructor() {
        this.instances = [];
    }

    initWebSocketInstance(
        address: string,
        topic: string,
        handler: (arg: any) => Promise<void>,
    ): void {
        const instance = {
            ws: new WebSocket(config.web3.websocketProvider),
            address,
            topic,
            handler,
        };
        this.initWebSocketEvent(instance);
        this.instances.push(instance);
    }

    private initWebSocketEvent({
        ws,
        address,
        topic,
        handler,
    }: IWebSocketInstance): void {
        ws.on('open', () => {
            ws.send(
                JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_subscribe',
                    params: ['logs', { address, topics: [topic] }],
                }),
            );
            Logger.log(`Instance created`, 'WebSocket');
            Logger.log({ address, topic }, 'WebSocket');
            setTimeout(
                () => this.ping({ ws, address, topic, handler }),
                this.PingInterval,
            );
        });

        ws.on('message', (message) => {
            const obj = JSON.parse(message.toString());
            if (obj.params) {
                Logger.log(`Handling message on ${address} <- ${topic}`);
                Logger.log(obj.params, 'WebSocket');
                handler(obj.params)
                    .catch((err) => {
                        Logger.error(err);
                        Sentry.captureMessage(err);
                    })
                    .finally(() => {
                        ws.close();
                    });
            }
        });

        ws.on('error', (err) => {
            Logger.warn(`Got an error on ${address} <- ${topic}`, 'WebSocket');
            Logger.error(err.message, err.stack, 'WebSocket');
            Sentry.captureException(err);
        });

        ws.on('close', (code: number, reason: string): void => {
            Logger.warn(
                `Server close on ${address} <- ${topic} - ${reason} (${code})`,
                'WebSocket',
            );
        });

        ws.on('pong', (message) => {
            Logger.log(message, 'WebSocket');
        });
    }

    private ping({ ws, address, topic, handler }: IWebSocketInstance): void {
        const message = `Ping ${address} <- ${topic}`;
        ws.ping(message);
        Logger.log(message, 'WebSocket');
        setTimeout(
            () => this.ping({ ws, address, topic, handler }),
            this.PingInterval,
        );
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WS = new WebSocketService();
