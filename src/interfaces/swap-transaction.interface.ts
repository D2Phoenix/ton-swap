import { SwapType } from './swap.type';

export interface SwapTransactionInterface {
    amount: string;
    quote: string;
    type: SwapType;
}
