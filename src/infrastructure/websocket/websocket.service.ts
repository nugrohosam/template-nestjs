import { Logger } from '@nestjs/common';
import { config } from 'src/config';
import WebSocket from 'ws';
import * as Sentry from '@sentry/node';

interface IWebSocketInstance {
    ws: WebSocket;
    address: string;
    topic: string;
    handler: (arg0: any) => Promise<void>;
    timeout?: NodeJS.Timeout;
}

class WebSocketService {
    private instances: Record<string, IWebSocketInstance>;

    constructor() {
        this.instances = {};
    }

    initWebSocketInstance(
        address: string,
        topic: string,
        handler: (arg: any) => Promise<void>,
    ): void {
        if (this.instances[`${address}_${topic}`]) {
            if (this.instances[`${address}_${topic}`].timeout) {
                clearTimeout(this.instances[`${address}_${topic}`].timeout);
            }
            return;
        }

        const instance: IWebSocketInstance = {
            ws: new WebSocket(config.web3.websocketProvider),
            address,
            topic,
            handler,
        };

        this.initWebSocketEvent(instance);
    }

    private initWebSocketEvent(instance: IWebSocketInstance): void {
        const { ws, address, topic, handler } = instance;
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
                        instance.timeout = setTimeout(() => ws.close(), 30000);
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
            delete this.instances[`${address}_${topic}`];
            Logger.warn(`Instance ${address} <- ${topic} deleted`, 'WebSocket');
        });

        this.instances[`${address}_${topic}`] = instance;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WS = new WebSocketService();
