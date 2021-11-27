import { EstimateTxType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface LiquidityTxInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: EstimateTxType;
    poolAmount: BigNumber;
    poolTokens: BigNumber;
}
