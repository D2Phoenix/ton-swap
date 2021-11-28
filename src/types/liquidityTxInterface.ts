import { EstimateTxType } from './transactionInterfaces';

export interface LiquidityTxInterface {
    amount: string;
    quote: string;
    txType: EstimateTxType;
    poolAmount: string;
    poolTokens: string;
}
