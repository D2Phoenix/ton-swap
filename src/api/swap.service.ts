import BigNumber from 'bignumber.js';
import { SwapTransactionRequestInterface } from 'interfaces/swap-transaction-request.interface';
import { SwapTransactionInterface } from 'interfaces/swap-transaction.interface';
import { SwapTypes } from 'interfaces/swap.types';
import { fromDecimals, toDecimals } from '../utils/decimals';

const prices: Record<string, string> = {
    'TON_AAVE': '13992321165469095',
    'TON_ADAB': '13992321165469095',
    'TON_DOGEBEAR': '6012130000000000000',
    'TON_DOTX': '676987000000000',
    'TON_LINK': '139648006504054849',
    'TON_MANA': '942162992418496691',
    'TON_SHIB': '89629924488831464863363',
    'TON_SOL': '90001000000',
    'TON_UNI': '172924000000000000',
    'TON_USDC': '506739',
    'TON_USDT': '3763139',
    'AAVE_TON': '69340020982',
    'ADAB_TON': '69340020982',
    'DOGEBEAR_TON': '1890',
    'DOTX_TON': '15787',
    'LINK_TON': '6988269404',
    'MANA_TON': '1398945703',
    'SHIB_TON': '11729',
    'SOL_TON': '11729',
    'UNI_TON': '5850767016',
    'USDC_TON': '247067507',
    'USDT_TON': '274213408',
}


class SwapService {
    getTransactionEstimation(data: SwapTransactionRequestInterface): Promise<SwapTransactionInterface> {
        // TODO: Implement real api for transaction estimation
        const amount = data.type === SwapTypes.EXACT_IN ? data.from!.amount! : data.to!.amount!;
        const amountToken = data.type === SwapTypes.EXACT_IN ? data.from!.token! : data.to!.token!;
        const quoteToken = data.type === SwapTypes.EXACT_IN ? data.to!.token! : data.from!.token!;
        const fromSymbol =  data.type === SwapTypes.EXACT_IN ? data.from!.token!.symbol : data.to!.token!.symbol;
        const toSymbol =  data.type === SwapTypes.EXACT_IN ? data.to!.token!.symbol : data.from!.token!.symbol;
        const price = prices[`${fromSymbol}_${toSymbol}`];
        const quote = new BigNumber(price || fromDecimals(new BigNumber('1'), quoteToken.decimals)).multipliedBy(toDecimals(amount, amountToken.decimals));
        return Promise.resolve({
            amount,
            quote,
            type: data.type,
            fee: new BigNumber('0.003'),
        });
    }

    getPriceImpact(data: SwapTransactionRequestInterface, transaction: SwapTransactionInterface): Promise<BigNumber> {
        // TODO: Implement real api for estimate price impact
        return Promise.resolve(new BigNumber('2.00'));
    }

    checkLiquidity(data: SwapTransactionRequestInterface, transaction: SwapTransactionInterface): Promise<boolean> {
        // TODO: Implement real api for estimate transaction liquidity
        return Promise.resolve(true);
    }
}

export default SwapService
