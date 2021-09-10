import BN from 'bn.js';
import { ValueTransformer } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TransformBN: ValueTransformer = {
    to: (value?: BN) => (value ? value.toString() : value),
    from: (value?: string) => (value ? new BN(value) : value),
};
