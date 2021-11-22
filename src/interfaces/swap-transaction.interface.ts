import { SwapTypes } from './swap.types';
import BigNumber from 'bignumber.js';

export interface SwapTransactionInterface {
    amount: BigNumber | null;
    quote: BigNumber | null;
    type: SwapTypes;
    fee: BigNumber;
}
