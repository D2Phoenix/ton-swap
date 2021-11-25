import BigNumber from 'bignumber.js';
import { SwapTxRequestInterface } from 'interfaces/swapTxRequestInterface';
import { SwapTxInterface } from 'interfaces/swapTxInterface';
import { TxType } from 'interfaces/transactionInterfaces';
import { fromDecimals, toDecimals } from '../utils/decimals';
import { LiquidityTxInterface } from '../interfaces/liquidityTxInterface';
import { LiquidityTxRequestInterface } from '../interfaces/liquidityTxRequestInterface';

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


class SmartContractsService {
    getTxEstimation(data: SwapTxRequestInterface): Promise<SwapTxInterface> {
        // TODO: Implement real api for transaction estimation
        const amount = data.txType === TxType.EXACT_IN ? data.from!.amount! : data.to!.amount!;
        const amountToken = data.txType === TxType.EXACT_IN ? data.from!.token! : data.to!.token!;
        const quoteToken = data.txType === TxType.EXACT_IN ? data.to!.token! : data.from!.token!;
        const fromSymbol =  data.txType === TxType.EXACT_IN ? data.from!.token!.symbol : data.to!.token!.symbol;
        const toSymbol =  data.txType === TxType.EXACT_IN ? data.to!.token!.symbol : data.from!.token!.symbol;
        const price = prices[`${fromSymbol}_${toSymbol}`];
        const quote = new BigNumber(price || fromDecimals(new BigNumber('1'), quoteToken.decimals)).multipliedBy(toDecimals(amount, amountToken.decimals));
        return Promise.resolve({
            amount,
            quote,
            txType: data.txType,
            fee: new BigNumber('0.003'),
        });
    }

    getLiquidityTxEstimation(data: LiquidityTxRequestInterface): Promise<LiquidityTxInterface> {
        // TODO: Implement real api for transaction estimation
        const amount = data.txType === TxType.EXACT_IN ? data.one!.amount! : data.two!.amount!;
        const amountToken = data.txType === TxType.EXACT_IN ? data.one!.token! : data.two!.token!;
        const quoteToken = data.txType === TxType.EXACT_IN ? data.two!.token! : data.one!.token!;
        const fromSymbol =  data.txType === TxType.EXACT_IN ? data.one!.token!.symbol : data.two!.token!.symbol;
        const toSymbol =  data.txType === TxType.EXACT_IN ? data.two!.token!.symbol : data.one!.token!.symbol;
        const price = prices[`${fromSymbol}_${toSymbol}`];
        const quote = new BigNumber(price || fromDecimals(new BigNumber('1'), quoteToken.decimals)).multipliedBy(toDecimals(amount, amountToken.decimals));
        return Promise.resolve({
            amount,
            quote,
            txType: data.txType,
            poolAmount: new BigNumber('1'),
            poolTokens: new BigNumber('100'),
        });
    }

    getPriceImpact(data: SwapTxRequestInterface, transaction: SwapTxInterface): Promise<BigNumber> {
        // TODO: Implement real api for estimate price impact
        return Promise.resolve(new BigNumber('2.00'));
    }

    checkLiquidity(data: SwapTxRequestInterface, transaction: SwapTxInterface): Promise<boolean> {
        // TODO: Implement real api for estimate transaction liquidity
        return Promise.resolve(true);
    }
}

export default SmartContractsService
