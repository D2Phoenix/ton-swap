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
        insufficientLiquidity: boolean;
        rate: string;
    };
}
