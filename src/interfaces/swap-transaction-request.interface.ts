import BigNumber from 'bignumber.js';

import TokenInterface from './token.interface';
import { SwapTypes } from './swap.types';

export interface SwapTransactionRequestInterface {
    from: TokenInterface;
    to: TokenInterface;
    fromAmount: BigNumber | null;
    toAmount: BigNumber | null;
    type: SwapTypes;
}
