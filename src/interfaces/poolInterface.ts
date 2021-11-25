import { InputTokenInterface } from './inputTokenInterface';
import BigNumber from 'bignumber.js';

export default interface PoolInterface {
    one: InputTokenInterface;
    two: InputTokenInterface;
    details: {
        poolTokens: BigNumber;
        poolAmount: BigNumber;
    }
}
