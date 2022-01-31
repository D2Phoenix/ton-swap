import { EstimateTxType } from './transactionInterfaces';

export interface LiquidityTxInterface {
  amount: string;
  quote: string;
  txType: EstimateTxType;
  poolAmount: string;
  poolOverallAmount: string;
  info: {
    token0PerToken1: string;
    token1PerToken0: string;
    share: string;
  };
}
