import { EstimateTxType } from './transactionInterfaces';
import BigNumber from 'bignumber.js';

export interface SwapTxInterface {
    amount: BigNumber;
    quote: BigNumber;
    txType: EstimateTxType;
    fee: BigNumber;
}
