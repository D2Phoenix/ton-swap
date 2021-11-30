import BigNumber from 'bignumber.js';
import { ChainId, UniswapPair, UniswapPairSettings, UniswapVersion } from 'simple-uniswap-sdk';

import { SwapTradeRequestInterface } from 'types/swapTradeRequestInterface';
import { SwapTradeInterface } from 'types/swapTradeInterface';
import { LiquidityTxInterface } from 'types/liquidityTxInterface';
import { LiquidityTxRequestInterface } from 'types/liquidityTxRequestInterface';
import { EstimateTxType } from 'types/transactionInterfaces';
import { SettingsInterface } from 'types/settingsInterface';

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
                quote: '',
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
            fromTokenContractAddress: data.input.token.address,
            // the contract address of the token you want to convert TO
            toTokenContractAddress: data.token.address,
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
                uniswapVersions: [UniswapVersion.v2, UniswapVersion.v3],
            }),
        });

        const uniswapPairFactory = await uniswapPair.createFactory();
        try {
            const trade = await uniswapPairFactory.trade(data.input.amount, 'input' as any);
            const amount0 = data.txType === EstimateTxType.EXACT_IN ? data.input.amount : trade.expectedConvertQuote;
            const amount1 = data.txType === EstimateTxType.EXACT_IN ? trade.expectedConvertQuote : data.input.amount;

            const result = {
                amount: data.input.amount,
                quote: trade.expectedConvertQuote,
                txType: data.txType,
                poolAmount: '1',
                poolOverallAmount: '100',
                info: {
                    token0PerToken1: new BigNumber(amount0)
                        .div(new BigNumber(amount1))
                        .toString(),
                    token1PerToken0: new BigNumber(amount1)
                        .div(new BigNumber(amount0))
                        .toString(),
                    share: new BigNumber('1').multipliedBy('100').div('100').toString(),
                }
            };
            trade.destroy();

            return Promise.resolve(result);
        } catch (error) {
            return Promise.resolve({
                amount: data.input.amount,
                quote: '',
                txType: data.txType,
                poolAmount: '0',
                poolOverallAmount: '0',
                info: {
                    token0PerToken1: '',
                    token1PerToken0: '',
                    share: '',
                }
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
