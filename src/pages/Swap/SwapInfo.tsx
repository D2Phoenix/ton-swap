import { useTranslation } from 'react-i18next';

import './SwapInfo.scss';
import { useAppSelector } from 'store/hooks';
import { selectSwapTrade, selectSwapInput0, selectSwapTxType, selectSwapInput1 } from 'store/swap/swapSlice';
import { EstimateTxType } from 'types/transactionInterfaces';
import { DEFAULT_SLIPPAGE } from 'constants/swap';
import { selectSettings } from 'store/app/appSlice';
import TokenUtils from 'utils/tokenUtils';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import React, { useMemo } from 'react';

function SwapInfo() {
  const { t } = useTranslation();
  const from = useAppSelector(selectSwapInput0);
  const to = useAppSelector(selectSwapInput1);
  const type = useAppSelector(selectSwapTxType);
  const settings = useAppSelector(selectSettings);
  const trade = useAppSelector(selectSwapTrade);

  const priceChangeDirection = useMemo(() => {
    return parseFloat(trade.priceImpact);
  }, [trade.priceImpact]);

  return (
    <div className={'swap-info-wrapper'}>
      {type === EstimateTxType.EXACT_IN && trade.minimumReceived && (
        <div>
          <p>{t('Minimum received')}</p>
          <p>
            {TokenUtils.toNumberDisplay(trade.minimumReceived)} {to.token.symbol}
          </p>
        </div>
      )}
      {type === EstimateTxType.EXACT_OUT && trade.maximumSent && (
        <div>
          <p>{t('Maximum sent')}</p>
          <p>
            {TokenUtils.toNumberDisplay(trade.maximumSent)} {from.token.symbol}
          </p>
        </div>
      )}
      {priceChangeDirection !== 0 && (
        <div>
          <p>{t('Price Impact')}</p>
          <span className="price">
            <span className={priceChangeDirection > 0 ? 'positive' : 'negative'}>
              <ChevronDownIcon revert={priceChangeDirection > 0} />
              <p>{trade.priceImpact} %</p>
            </span>
          </span>
        </div>
      )}
      <div>
        <p>{t('Liquidity Provider Fee')}</p>
        <p>
          {TokenUtils.toNumberDisplay(trade.liquidityProviderFee)} {from.token.symbol}
        </p>
      </div>
      <div>
        <p>{t('Allowed slippage')}</p>
        <p>{settings.slippage || DEFAULT_SLIPPAGE} %</p>
      </div>
    </div>
  );
}

export default SwapInfo;
