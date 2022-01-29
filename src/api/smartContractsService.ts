import BigNumber from 'bignumber.js';
import {
  ChainId,
  TradeContext,
  UniswapPair,
  UniswapPairFactory,
  UniswapPairSettings,
  UniswapVersion,
} from 'simple-uniswap-sdk';

import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT,
  CONFIRM_PRICE_IMPACT,
} from 'constants/swap';

import { LiquidityTxInterface } from 'types/liquidityTxInterface';
import { LiquidityTxRequestInterface } from 'types/liquidityTxRequestInterface';
import { SettingsInterface } from 'types/settingsInterface';
import { SwapTradeInterface } from 'types/swapTradeInterface';
import { SwapTradeRequestInterface } from 'types/swapTradeRequestInterface';
import { EstimateTxType } from 'types/transactionInterfaces';

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
      const tradePromise = uniswapPairFactory.trade(data.input.amount, direction);
      const tradeForImpactPromise = uniswapPairFactory.trade('1', direction);
      const trade = await tradePromise;
      const tradeForImpact = await tradeForImpactPromise;
      const amount0 = data.txType === EstimateTxType.EXACT_IN ? data.input.amount : trade.expectedConvertQuote;
      const amount1 = data.txType === EstimateTxType.EXACT_IN ? trade.expectedConvertQuote : data.input.amount;
      const rate = new BigNumber(amount0).div(new BigNumber(amount1)).toString();
      const priceImpact = await this.getPriceImpact(data, rate, tradeForImpact);

      const result = {
        amount: data.input.amount,
        quote: trade.expectedConvertQuote,
        txType: data.txType,
        trade: {
          fee: trade.liquidityProviderFeePercent.toString(),
          liquidityProviderFee: trade.liquidityProviderFee,
          maximumSent: trade.maximumSent,
          minimumReceived: trade.minAmountConvertQuote,
          priceImpact: priceImpact,
          priceImpactSeverity: this.calcPriceImpactSeverity(priceImpact),
          insufficientLiquidity: false,
          rate: rate,
        },
      };
      trade.destroy();
      tradeForImpact.destroy();

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
          priceImpactSeverity: 0,
          insufficientLiquidity: true,
          rate: '0',
        },
      });
    }
  }

  async getLiquidityTxEstimation(
    data: LiquidityTxRequestInterface,
    settings: SettingsInterface,
  ): Promise<LiquidityTxInterface> {
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
          token0PerToken1: new BigNumber(amount0).div(new BigNumber(amount1)).toString(),
          token1PerToken0: new BigNumber(amount1).div(new BigNumber(amount0)).toString(),
          share: new BigNumber('1').multipliedBy('100').div('100').toString(),
        },
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
        },
      });
    }
  }

  async getPriceImpact(data: LiquidityTxRequestInterface, originalRate: string, trade: TradeContext): Promise<string> {
    // TODO: Implement real api for estimate price impact
    const inputAmount = '1';
    const amount0 = data.txType === EstimateTxType.EXACT_IN ? inputAmount : trade.expectedConvertQuote;
    const amount1 = data.txType === EstimateTxType.EXACT_IN ? trade.expectedConvertQuote : inputAmount;
    const rate = new BigNumber(amount0).div(new BigNumber(amount1)).toString();
    const impact = new BigNumber(rate)
      .multipliedBy(100)
      .div(new BigNumber(originalRate))
      .minus(100)
      .precision(2)
      .toFixed();
    return Promise.resolve(impact);
  }

  calcPriceImpactSeverity(priceImpact: string): number {
    const impact = Number(priceImpact);
    if (impact <= -BLOCKED_PRICE_IMPACT) {
      return 5;
    }
    if (impact <= -CONFIRM_PRICE_IMPACT) {
      return 4;
    }
    if (impact <= -ALLOWED_PRICE_IMPACT_HIGH) {
      return 3;
    }
    if (impact <= -ALLOWED_PRICE_IMPACT_MEDIUM) {
      return 2;
    }
    if (impact <= -ALLOWED_PRICE_IMPACT_LOW) {
      return 1;
    }
    return 0;
  }

  checkLiquidity(data: LiquidityTxRequestInterface, transaction: SwapTradeInterface): Promise<boolean> {
    // TODO: Implement real api for estimate transaction liquidity
    return Promise.resolve(transaction.trade.insufficientLiquidity);
  }
}

export default SmartContractsService;
