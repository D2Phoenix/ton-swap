import { SwapType } from './swap.type';
import BigNumber from 'bignumber.js';

export interface SwapTransactionInterface {
    amount: BigNumber | null;
    quote: BigNumber | null;
    type: SwapType;
}
