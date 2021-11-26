import { TxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';

export interface LiquidityTxInRequestInterface {
    in: InputTokenInterface;
    token: TokenInterface;
    txType: TxType.EXACT_IN;
}

export interface LiquidityTxOutRequestInterface {
    out: InputTokenInterface;
    token: TokenInterface;
    txType: TxType.EXACT_OUT;
}
