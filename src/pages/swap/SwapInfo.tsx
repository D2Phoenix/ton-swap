import './SwapInfo.scss';
import { useAppSelector } from 'store/hooks';
import {
    selectSwapTrade,
    selectSwapInput0,
    selectSwapTxType,
    selectSwapInput1
} from 'store/swap/swapSlice';
import { EstimateTxType } from 'types/transactionInterfaces';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { useMemo } from 'react';
import { selectSettings } from 'store/app/appSlice';
import TokenUtils from 'utils/tokenUtils';

function SwapInfo() {
    const from = useAppSelector(selectSwapInput0);
    const to = useAppSelector(selectSwapInput1);
    const type = useAppSelector(selectSwapTxType);
    const settings = useAppSelector(selectSettings);
    const trade = useAppSelector(selectSwapTrade);

    return (
        <div className={"swap-info-wrapper"}>
            <span>Transaction Details</span>
            <div>
                <span className="text-small">Liquidity Provider Fee</span>
                <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.liquidityProviderFee)} {from.token.symbol}</span>
            </div>
            <div>
                <span className="text-small">Price Impact</span>
                <span className="text-small text-semibold">{trade.priceImpact} %</span>
            </div>
            <div>
                <span className="text-small">Allowed slippage</span>
                <span className="text-small text-semibold">{settings.slippage || DEFAULT_SLIPPAGE} %</span>
            </div>
            {
                type === EstimateTxType.EXACT_IN && trade.minimumReceived && <div>
                  <span className="text-small">Minimum received</span>
                  <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.minimumReceived)} {to.token.symbol}</span>
                </div>
            }
            {
                type === EstimateTxType.EXACT_OUT && trade.maximumSent && <div>
                  <span className="text-small">Maximum sent</span>
                  <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.maximumSent)} {from.token.symbol}</span>
                </div>
            }
        </div>
    )
}

export default SwapInfo;
