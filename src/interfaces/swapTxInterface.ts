import { TxType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface SwapTxInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: TxType;
    fee: BigNumber;
}
