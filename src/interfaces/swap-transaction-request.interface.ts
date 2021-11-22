import { SwapTypes } from './swap.types';
import { InputTokenInterface } from './input-token.interface';

export interface SwapTransactionRequestInterface {
    from?: InputTokenInterface;
    to?: InputTokenInterface;
    type: SwapTypes;
}
