import BigNumber from 'bignumber.js';
import { SwapTradeRequestInterface } from 'types/swapTradeRequestInterface';
import { SwapTradeInterface } from 'types/swapTradeInterface';
import { LiquidityTxInterface } from 'types/liquidityTxInterface';
import { LiquidityTxRequestInterface } from 'types/liquidityTxRequestInterface';
import PoolsService from './poolsService';

import { ChainId, UniswapPair, UniswapPairSettings, UniswapVersion } from 'simple-uniswap-sdk';
import { EstimateTxType } from '../types/transactionInterfaces';
import { SettingsInterface } from '../types/settingsInterface';


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

    async getTrade(data: SwapTradeRequestInterface, settings: SettingsInterface): Promise<SwapTradeInterface> {
        // TODO: Implement Ton network contracts api for transaction estimation
        // Using simple-uniswap-sdk for demo purpose
        const uniswapPair = new UniswapPair({
            // the contract address of the token you want to convert FROM
            fromTokenContractAddress: data.txType === EstimateTxType.EXACT_IN ? data.input.token.address : data.token.address,
            // the contract address of the token you want to convert TO
            toTokenContractAddress: data.txType === EstimateTxType.EXACT_IN ? data.token.address : data.input.token.address,
            // the ethereum address of the user using this part of the dApp
            ethereumAddress: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
            chainId: ChainId.MAINNET,
            settings: new UniswapPairSettings({
                // if not supplied it will use `0.005` which is 0.5%
                // please pass it in as a full number decimal so 0.7%
                // would be 0.007
                slippage: new BigNumber(settings.slippage).div('100').toNumber(),
                // if not supplied it will use 20 a deadline minutes
                deadlineMinutes: new BigNumber(settings.deadline).toNumber(),
                disableMultihops: true,
                uniswapVersions: [UniswapVersion.v3],
            }),
        });

        const uniswapPairFactory = await uniswapPair.createFactory();
        const direction: any = data.txType === EstimateTxType.EXACT_IN ? 'input' : 'output';
        try {
            const trade = await uniswapPairFactory.trade(data.input.amount, direction);
            const amount0 = data.txType === EstimateTxType.EXACT_IN ? data.input.amount : trade.expectedConvertQuote;
            const amount1 = data.txType === EstimateTxType.EXACT_IN ? trade.expectedConvertQuote : data.input.amount;
            const rate = new BigNumber(amount0)
                .div(new BigNumber(amount1))
                .toString();

            const result = {
                amount: data.input.amount,
                quote: trade.expectedConvertQuote,
                txType: data.txType,
                trade: {
                    fee: trade.liquidityProviderFeePercent.toString(),
                    liquidityProviderFee: trade.liquidityProviderFee,
                    maximumSent: trade.maximumSent,
                    minimumReceived: trade.minAmountConvertQuote,
                    priceImpact: await this.getPriceImpact(data),
                    insufficientLiquidity: false,
                    rate: rate,
                }
            };
            trade.destroy();

            return Promise.resolve(result);
        } catch (error) {
            return Promise.resolve({
                amount: data.input.amount,
                quote: '0',
                txType: data.txType,
                trade: {
                    fee: '0',
                    liquidityProviderFee: '0',
                    maximumSent: '',
                    minimumReceived: '',
                    priceImpact: '0',
                    insufficientLiquidity: true,
                    rate: '0',
                }
            });
        }
    }

    async getLiquidityTxEstimation(data: LiquidityTxRequestInterface, settings: SettingsInterface): Promise<LiquidityTxInterface> {
        // TODO: Implement real api for transaction estimation
        // Using simple-uniswap-sdk for demo purpose
        const uniswapPair = new UniswapPair({
            // the contract address of the token you want to convert FROM
            fromTokenContractAddress: data.txType === EstimateTxType.EXACT_IN ? data.input.token.address : data.token.address,
            // the contract address of the token you want to convert TO
            toTokenContractAddress: data.txType === EstimateTxType.EXACT_IN ? data.token.address : data.input.token.address,
            // the ethereum address of the user using this part of the dApp
            ethereumAddress: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
            chainId: ChainId.MAINNET,
            settings: new UniswapPairSettings({
                // if not supplied it will use `0.005` which is 0.5%
                // please pass it in as a full number decimal so 0.7%
                // would be 0.007
                slippage: new BigNumber(settings.slippage).div('100').toNumber(),
                // if not supplied it will use 20 a deadline minutes
                deadlineMinutes: new BigNumber(settings.deadline).toNumber(),
                disableMultihops: true,
                uniswapVersions: [UniswapVersion.v3],
            }),
        });

        const uniswapPairFactory = await uniswapPair.createFactory();
        try {
            const trade = await uniswapPairFactory.trade(data.input.amount, 'input' as any);

            const result = {
                amount: data.input.amount,
                quote: trade.expectedConvertQuote,
                txType: data.txType,
                poolAmount: '1',
                poolOverallAmount: '100',
            };
            trade.destroy();

            return Promise.resolve(result);
        } catch (error) {
            return Promise.resolve({
                amount: data.input.amount,
                quote: '0',
                txType: data.txType,
                poolAmount: '0',
                poolOverallAmount: '0',
            });
        }
    }

    getPriceImpact(data: LiquidityTxRequestInterface): Promise<string> {
        // TODO: Implement real api for estimate price impact
        return Promise.resolve('2.00');
    }

    checkLiquidity(data: LiquidityTxRequestInterface, transaction: SwapTradeInterface): Promise<boolean> {
        // TODO: Implement real api for estimate transaction liquidity
        return Promise.resolve(transaction.trade.insufficientLiquidity);
    }
}

export default SmartContractsService
