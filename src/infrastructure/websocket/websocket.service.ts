import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { config } from 'src/config';
import WebSocket from 'ws';
import * as Sentry from '@sentry/node';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import { WithdrawApplication } from 'src/modules/me/applications/withdraw.application';
import { ILogParams } from 'src/modules/parties/types/logData';
import { SwapQuoteApplication } from 'src/modules/parties/applications/swap-quote.application';
import { ClosePartyApplication } from 'src/modules/me/applications/close-party.application';
import { LeavePartyApplication } from 'src/modules/me/applications/leave-party.application';

@Injectable()
export class WebsocketService {
    // wss://echo.websocket.org is a test websocket server
    private ws: WebSocket;
    private listEventHandler: Record<string, (arg0: any) => Promise<void>> = {};

    constructor(
        private readonly swapApplication: SwapQuoteApplication,
        private readonly withdrawApplication: WithdrawApplication,
        private readonly leaveApplication: LeavePartyApplication,
        private readonly closeApplication: ClosePartyApplication,
    ) {
        this.registerHandler(
            PartyContract.getEventSignature(PartyEvents.Qoute0xSwap),
            async (logParams: ILogParams) => {
                await this.swapApplication.buySync(logParams);
            },
        );

        this.registerHandler(
            PartyContract.getEventSignature(PartyEvents.WithdrawEvent),
            async (logParams: ILogParams) => {
                await this.withdrawApplication.sync(logParams);
            },
        );

        this.registerHandler(
            PartyContract.getEventSignature(PartyEvents.LeavePartyEvent),
            async (logParams: ILogParams) => {
                await this.leaveApplication.sync(logParams);
            },
        );

        this.registerHandler(
            PartyContract.getEventSignature(PartyEvents.ClosePartyEvent),
            async (logParams: ILogParams) => {
                await this.closeApplication.sync(logParams);
            },
        );

        this.init();
    }

    registerHandler(
        topic: string,
        handler: (arg0: any) => Promise<void>,
    ): void {
        this.listEventHandler[topic] = handler;
    }

    init(): void {
        this.ws = new WebSocket(config.web3.websocketProvider);

        this.ws.on('message', (message) => {
            this.onMessage(message);
        });
        this.ws.on('error', (err) => {
            Logger.error(err.message, err.stack, 'WebSocket');
            Sentry.captureException(err);
        });
        this.ws.on('open', () => {
            this.sendHandlers();
        });
        this.ws.on('close', (code: number, reason: string): void => {
            Logger.warn(`Closed: ${reason} (${code})`, 'WebSocket');
            Logger.log('Reinit server', 'WebSocket');
            this.init();
        });
        this.ws.on('pong', (data: Buffer) => {
            Logger.log('Pong: ' + data.toString(), 'WebSocket');
        });
    }

    async onMessage(message: WebSocket.Data): Promise<void> {
        const obj = JSON.parse(message.toString());
        if (obj.params) {
            await this.listEventHandler[obj.params.result.topics[0]](
                obj.params,
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    send(data: Object): void {
        this.ws.send(JSON.stringify(data));
    }

    sendHandlers(): void {
        Object.keys(this.listEventHandler).forEach((key) => {
            Logger.log(`Register Topic: ${key}`, 'WebSocket');
            this.send({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_subscribe',
                params: ['logs', { topics: [key] }],
            });
        });
        this.ping();
    }

    @Cron(config.scheduler.wsPingCron)
    ping(): void {
        const topics = Object.keys(this.listEventHandler);
        const message = `${topics.length} topics registered. current state is ${this.ws.readyState}`;
        Logger.log(`Ping: ${message}`, 'WebSocket');
        this.ws.ping(message);
    }

    @Cron(config.scheduler.wsInitCron)
    refresh(): void {
        if (this.ws.readyState === 1) {
            this.ws.close(4001, 'Refreshing connection');
        }
    }
}
