import './SwapInfo.scss';
import { useAppSelector } from 'store/hooks';
import {
    selectSwapDetails,
    selectSwapInput0,
    selectSwapTxType,
    selectSwapInput1
} from 'store/swap/swap.slice';
import { EstimateTxType } from 'types/transactionInterfaces';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { useMemo } from 'react';
import { selectSettings } from 'store/app/app.slice';
import TokenUtils from 'utils/tokenUtils';

function SwapInfo() {
    const from = useAppSelector(selectSwapInput0);
    const to = useAppSelector(selectSwapInput1);
    const type = useAppSelector(selectSwapTxType);
    const settings = useAppSelector(selectSettings);
    const details = useAppSelector(selectSwapDetails);

    const liquidityFee = useMemo(() => {
        return TokenUtils.getFeeDisplay(from, details.fee);
    }, [from, details]);

    const minimumReceived = useMemo(() => {
        return TokenUtils.getMinimumDisplayWithSlippage(to, settings.slippage || DEFAULT_SLIPPAGE);
    }, [to, settings]);

    const maximumSent = useMemo(() => {
        return TokenUtils.getMaximumDisplayWithSlippage(from, settings.slippage || DEFAULT_SLIPPAGE);
    }, [from, settings]);

    return (
        <div className={"swap-info-wrapper"}>
            <span>Transaction Details</span>
            <div>
                <span className="text-small">Liquidity Provider Fee</span>
                <span className="text-small text-semibold">{liquidityFee} {from.token.symbol}</span>
            </div>
            <div>
                <span className="text-small">Price Impact</span>
                <span className="text-small text-semibold">{details.priceImpact.toFixed()} %</span>
            </div>
            <div>
                <span className="text-small">Allowed slippage</span>
                <span className="text-small text-semibold">{settings.slippage || DEFAULT_SLIPPAGE} %</span>
            </div>
            {
                type === EstimateTxType.EXACT_IN && to && <div>
                  <span className="text-small">Minimum received</span>
                  <span className="text-small text-semibold">{minimumReceived} {to.token.symbol}</span>
                </div>
            }
            {
                type === EstimateTxType.EXACT_OUT && from && <div>
                  <span className="text-small">Maximum sent</span>
                  <span className="text-small text-semibold">{maximumSent} {from.token.symbol}</span>
                </div>
            }
        </div>
    )
}

export default SwapInfo;
