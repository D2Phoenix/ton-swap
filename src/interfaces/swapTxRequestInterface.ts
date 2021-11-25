import { TxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';

export interface SwapTxRequestInterface {
    from?: InputTokenInterface;
    to?: InputTokenInterface;
    txType: TxType;
}
