import BigNumber from 'bignumber.js';
import {
    SwapTxRequestInterface
} from 'types/swapTxRequestInterface';
import { SwapTxInterface } from 'types/swapTxInterface';
import { fromDecimals, toDecimals } from 'utils/decimals';
import { LiquidityTxInterface } from 'types/liquidityTxInterface';
import {
    LiquidityTxRequestInterface
} from 'types/liquidityTxRequestInterface';
import PoolsService from './poolsService';

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

const poolsService = new PoolsService();

class SmartContractsService {
    getTxEstimation(data: SwapTxRequestInterface): Promise<SwapTxInterface> {
        // TODO: Implement real api for transaction estimation
        const amount = data.input.amount;
        const amountToken = data.input.token;
        const quoteToken = data.token;
        const fromSymbol = data.input.token.symbol;
        const toSymbol = data.token.symbol;
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
        const amount = data.input.amount;
        const amountToken = data.input.token;
        const quoteToken = data.token;
        const fromSymbol = data.input.token.symbol;
        const toSymbol = data.token.symbol;
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

    getPriceImpact(data: LiquidityTxRequestInterface, transaction: SwapTxInterface): Promise<BigNumber> {
        // TODO: Implement real api for estimate price impact
        return Promise.resolve(new BigNumber('2.00'));
    }

    checkLiquidity(data: LiquidityTxRequestInterface, transaction: SwapTxInterface): Promise<boolean> {
        // TODO: Implement real api for estimate transaction liquidity
        return poolsService.getPools().then((pools) => {
            const token0 = data.input.token.address.toLowerCase();
            const token1 = data.token.address.toLowerCase();
            const pool = pools.find((pool) =>
                (pool.token0.id.toLowerCase() === token0 || pool.token0.id.toLowerCase() === token1)
                && (pool.token1.id.toLowerCase() === token0 || pool.token1.id.toLowerCase() === token1));
            return !!pool;
        })
    }
}

export default SmartContractsService
