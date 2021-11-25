import { TransactionType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface LiquidityTransactionInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: TransactionType;
    poolAmount: BigNumber;
    poolTokens: BigNumber;
}
