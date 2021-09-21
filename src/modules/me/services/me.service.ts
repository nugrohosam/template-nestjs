import BN from 'bn.js';

export class MeService {
    generateDepositSignature(partyName: string, amount: BN): string {
        const message = `I want to deposit money at ${partyName} with amount of ${amount.toString()} mwei`;
        console.log(`message[deposit]: ${message}`);
        return message;
    }

    generateWithdrawSignature(partyName: string, percentage: number): string {
        const message = `I want to withdraw ${percentage}% of my money at ${partyName}`;
        console.log(`message[withdraw]: ${message}`);
        return message;
    }
}
