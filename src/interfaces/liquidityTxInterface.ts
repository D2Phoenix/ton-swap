import { TxType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface LiquidityTxInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: TxType;
    poolAmount: BigNumber;
    poolTokens: BigNumber;
}
