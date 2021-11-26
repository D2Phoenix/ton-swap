import { TxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';

export interface SwapTxInRequestInterface {
    in: InputTokenInterface;
    token: TokenInterface;
    txType: TxType.EXACT_IN;
}

export interface SwapTxOutRequestInterface {
    out: InputTokenInterface;
    token: TokenInterface;
    txType: TxType.EXACT_OUT;
}
