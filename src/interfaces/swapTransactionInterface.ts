import { TransactionType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface SwapTransactionInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: TransactionType;
    fee: BigNumber;
}
