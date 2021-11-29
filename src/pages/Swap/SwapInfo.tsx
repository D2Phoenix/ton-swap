import { useTranslation } from 'react-i18next';

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
import { selectSettings } from 'store/app/appSlice';
import TokenUtils from 'utils/tokenUtils';

function SwapInfo() {
    const {t} = useTranslation();
    const from = useAppSelector(selectSwapInput0);
    const to = useAppSelector(selectSwapInput1);
    const type = useAppSelector(selectSwapTxType);
    const settings = useAppSelector(selectSettings);
    const trade = useAppSelector(selectSwapTrade);

    return (
        <div className={"swap-info-wrapper"}>
            <span>{t('Transaction Details')}</span>
            <div>
                <span className="text-small">{t('Liquidity Provider Fee')}</span>
                <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.liquidityProviderFee)} {from.token.symbol}</span>
            </div>
            <div>
                <span className="text-small">{t('Price Impact')}</span>
                <span className="text-small text-semibold">{trade.priceImpact} %</span>
            </div>
            <div>
                <span className="text-small">{t('Allowed slippage')}</span>
                <span className="text-small text-semibold">{settings.slippage || DEFAULT_SLIPPAGE} %</span>
            </div>
            {
                type === EstimateTxType.EXACT_IN && trade.minimumReceived && <div>
                  <span className="text-small">{t('Minimum received')}</span>
                  <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.minimumReceived)} {to.token.symbol}</span>
                </div>
            }
            {
                type === EstimateTxType.EXACT_OUT && trade.maximumSent && <div>
                  <span className="text-small">{t('Maximum sent')}</span>
                  <span className="text-small text-semibold">{TokenUtils.getNumberDisplay(trade.maximumSent)} {from.token.symbol}</span>
                </div>
            }
        </div>
    )
}

export default SwapInfo;