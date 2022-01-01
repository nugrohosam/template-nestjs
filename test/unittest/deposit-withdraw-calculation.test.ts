import BN from 'bn.js';
import {
    addAmount,
    substractAmount,
} from '../../src/modules/parties/services/calculation.service';

describe('addAmount deposit', () => {
    it('should return the true amount', () => {
        const totalDeposit = new BN(2000000);
        const amount = new BN(1000000);
        const result = 3000000;
        const expectedResult = result.toString();
        expect(addAmount(totalDeposit, amount).toString()).toBe(expectedResult);
    });

    it('should throw error if amount cannot be zero', () => {
        try {
            const totalDeposit = new BN(2000000);
            const amount = new BN(0);
            addAmount(totalDeposit, amount);
        } catch (error) {
            expect(error.message).toBe('amount cannot be zero');
        }
    });

    it('should throw error if amount cannot be negative', () => {
        try {
            const totalDeposit = new BN(2000000);
            const amount = new BN(10000).neg();
            addAmount(totalDeposit, amount);
        } catch (error) {
            expect(error.message).toBe('amount cannot be negative number');
        }
    });
});

describe('substractAmount deposit', () => {
    it('should return the true amount', () => {
        const totalDeposit = new BN(2000000);
        const amount = new BN(1000000);
        const result = 1000000;
        const expectedResult = result.toString();
        expect(substractAmount(totalDeposit, amount).toString()).toBe(
            expectedResult,
        );
    });

    it('should throw error if amount cannot be zero', () => {
        try {
            const totalDeposit = new BN(2000000);
            const amount = new BN(0);
            substractAmount(totalDeposit, amount);
        } catch (error) {
            expect(error.message).toBe('amount cannot be zero');
        }
    });

    it('should throw error if amount cannot be negative', () => {
        try {
            const totalDeposit = new BN(2000000);
            const amount = new BN(10000).neg();
            substractAmount(totalDeposit, amount);
        } catch (error) {
            expect(error.message).toBe('amount cannot be negative number');
        }
    });
});
