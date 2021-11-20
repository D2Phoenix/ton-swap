import './SwapInfo.scss';
import { useAppSelector } from '../../store/hooks';
import {
    selectSwapDetails,
    selectSwapFrom,
    selectSwapFromAmount,
    selectSwapLastSwapType, selectSwapSettings,
    selectSwapTo, selectSwapToAmount
} from '../../store/swap/swap.slice';
import { SwapType } from '../../interfaces/swap.type';
import { DEFAULT_SLIPPAGE } from '../../constants/swap';
import { useMemo } from 'react';
import { toDecimals } from '../../utils/decimals';
import BigNumber from 'bignumber.js';

const PRECISION = 6;
const FEE_PRECISION = 2;

function SwapInfo() {
    const swapType = useAppSelector(selectSwapLastSwapType);
    const fromToken = useAppSelector(selectSwapFrom);
    const toToken = useAppSelector(selectSwapTo);
    const fromTokenAmount = useAppSelector(selectSwapFromAmount);
    const toTokenAmount = useAppSelector(selectSwapToAmount);
    const swapSettings = useAppSelector(selectSwapSettings);
    const swapDetails = useAppSelector(selectSwapDetails);

    const liquidityFee = useMemo(() => {
        const fee = fromTokenAmount!.multipliedBy(swapDetails!.fee);
        return toDecimals(fee, fromToken!.decimals).precision(FEE_PRECISION).toFixed();
    }, [fromToken, fromTokenAmount, swapDetails]);

    const minimumReceived = useMemo(() => {
        return toDecimals(toTokenAmount!, toToken!.decimals)
            .multipliedBy(new BigNumber('100').minus(new BigNumber(swapSettings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(PRECISION).toFixed();
    }, [toToken, toTokenAmount, swapSettings]);

    const maximumSent = useMemo(() => {
        return toDecimals(fromTokenAmount!, fromToken!.decimals)
            .multipliedBy(new BigNumber('100').plus(new BigNumber(swapSettings.slippage || DEFAULT_SLIPPAGE)).div('100'))
            .precision(PRECISION).toFixed();
    }, [fromToken, fromTokenAmount, swapSettings]);

    return (
        <div className="swap-info-wrapper">
            <h4>Transaction Details</h4>
            <div>
                <span className="text-small">Liquidity Provider Fee</span>
                <span className="text-small text-semibold">{liquidityFee} {fromToken!.symbol}</span>
            </div>
            <div>
                <span className="text-small">Price Impact</span>
                <span className="text-small text-semibold">{swapDetails.priceImpact.toFixed()} %</span>
            </div>
            <div>
                <span className="text-small">Allowed slippage</span>
                <span className="text-small text-semibold">{swapSettings.slippage || DEFAULT_SLIPPAGE} %</span>
            </div>
            {
                swapType === SwapType.EXACT_IN && toToken && <div>
                  <span className="text-small">Minimum received</span>
                  <span className="text-small text-semibold">{minimumReceived} {toToken.symbol}</span>
                </div>
            }
            {
                swapType === SwapType.EXACT_OUT && fromToken && <div>
                  <span className="text-small">Maximum sent</span>
                  <span className="text-small text-semibold">{maximumSent} {fromToken.symbol}</span>
                </div>
            }
        </div>
    )
}

export default SwapInfo;
