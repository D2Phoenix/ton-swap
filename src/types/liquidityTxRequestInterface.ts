import { EstimateTxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';

export interface LiquidityTxRequestInterface {
  input: InputTokenInterface;
  token: TokenInterface;
  txType: EstimateTxType;
  source?: 'manual' | 'auto';
}
