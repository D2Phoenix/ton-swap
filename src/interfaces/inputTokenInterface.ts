import TokenInterface from './tokenInterface';
import BigNumber from 'bignumber.js';

export interface InputTokenInterface {
    token?: TokenInterface;
    amount?: BigNumber;
    burnAmount?: BigNumber;
}
