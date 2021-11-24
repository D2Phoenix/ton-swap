import BigNumber from 'bignumber.js';
import { SwapTransactionRequestInterface } from 'interfaces/swap-transaction-request.interface';
import { SwapTransactionInterface } from 'interfaces/swap-transaction.interface';
import { SwapTypes } from 'interfaces/swap.types';
import { fromDecimals, toDecimals } from '../utils/decimals';

const prices: Record<string, Record<string, string>> = {
    'TON': {
        'AAVE': '13992321165469095',
        'ADAB': '13992321165469095',
        'DOGEBEAR': '6012130000000000000',
        'DOTX': '676987000000000',
        'LINK': '139648006504054849',
        'MANA': '942162992418496691',
        'SHIB': '89629924488831464863363',
        'SOL': '90001000000',
        'UNI': '172924000000000000',
        'USDC': '506739',
        'USDT': '3763139',
    }
}


class SwapService {
    getTransactionEstimation(data: SwapTransactionRequestInterface): Promise<SwapTransactionInterface> {
        // TODO: Implement real api for transaction estimation
        const amount = data.type === SwapTypes.EXACT_IN ? data.from!.amount! : data.to!.amount!;
        const amountToken = data.type === SwapTypes.EXACT_IN ? data.from!.token! : data.to!.token!;
        const quoteToken = data.type === SwapTypes.EXACT_IN ? data.to!.token! : data.from!.token!;
        const toSymbol =  data.type === SwapTypes.EXACT_IN ? data.from!.token!.symbol : data.to!.token!.symbol;
        const fromSymbol =  data.type === SwapTypes.EXACT_IN ? data.to!.token!.symbol : data.from!.token!.symbol;
        const priceMap = prices[toSymbol] || {};
        const quote = new BigNumber(priceMap[fromSymbol] || fromDecimals(new BigNumber('1'), quoteToken.decimals)).multipliedBy(toDecimals(amount, amountToken.decimals));
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
