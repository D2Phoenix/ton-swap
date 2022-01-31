import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';
import { EstimateTxType } from './transactionInterfaces';

export interface LiquidityTxRequestInterface {
  input: InputTokenInterface;
  token: TokenInterface;
  txType: EstimateTxType;
  source?: 'manual' | 'auto';
}
