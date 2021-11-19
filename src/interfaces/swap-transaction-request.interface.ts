import TokenInterface from './token.interface';
import { SwapType } from './swap.type';

export interface SwapTransactionRequestInterface {
    to: TokenInterface;
    from: TokenInterface;
    toAmount: string;
    fromAmount: string;
    type: SwapType;
}
