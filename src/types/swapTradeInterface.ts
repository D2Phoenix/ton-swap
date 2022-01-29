import { EstimateTxType } from './transactionInterfaces';

export interface SwapTradeInterface {
  amount: string;
  quote: string;
  txType: EstimateTxType;
  trade: {
    fee: string;
    liquidityProviderFee: string;
    maximumSent: string | null;
    minimumReceived: string | null;
    priceImpact: string;
    priceImpactSeverity: number;
    insufficientLiquidity: boolean;
    rate: string;
  };
}
