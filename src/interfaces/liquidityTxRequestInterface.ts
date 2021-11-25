import { TxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';

export interface LiquidityTxRequestInterface {
    one?: InputTokenInterface;
    two?: InputTokenInterface;
    txType: TxType;
}
