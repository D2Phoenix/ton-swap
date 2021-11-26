import TokenInterface from './tokenInterface';
import BigNumber from 'bignumber.js';
import PoolInterface from './poolInterface';

export interface InputPoolInterface {
    token: PoolInterface;
    amount: BigNumber;
    overallAmount?: BigNumber;
    burnAmount?: BigNumber;
}
