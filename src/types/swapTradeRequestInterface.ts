import { EstimateTxType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';
import TokenInterface from './tokenInterface';

export interface SwapTradeRequestInterface {
  input: InputTokenInterface;
  token: TokenInterface;
  txType: EstimateTxType;
  source?: 'manual' | 'auto';
}
