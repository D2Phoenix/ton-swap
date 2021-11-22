import { SwapTypes } from './swap.types';
import BigNumber from 'bignumber.js';

export interface SwapTransactionInterface {
    amount: BigNumber;
    quote: BigNumber;
    type: SwapTypes;
    fee: BigNumber;
}
