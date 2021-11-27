import { TxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';

export interface SwapTxRequestInterface {
    input: InputTokenInterface;
    token: TokenInterface;
    txType: TxType;
}
