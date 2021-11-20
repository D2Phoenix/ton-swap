import BigNumber from 'bignumber.js';

import TokenInterface from './token.interface';
import { SwapType } from './swap.type';

export interface SwapTransactionRequestInterface {
    from: TokenInterface;
    to: TokenInterface;
    fromAmount: BigNumber | null;
    toAmount: BigNumber | null;
    type: SwapType;
}
