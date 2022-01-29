import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TokenUtils from 'utils/tokenUtils';

import { useAppSelector } from 'store/hooks';
import {
  selectLiquidityInfo,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityLoading,
} from 'store/liquidity/liquiditySlice';

import './LiquidityInfo.scss';

function LiquidityInfo() {
  const { t } = useTranslation();
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const loading = useAppSelector(selectLiquidityLoading);
  const info = useAppSelector(selectLiquidityInfo);

  const token0PerToken1Display = useMemo(() => {
    return TokenUtils.toNumberDisplay(info.token0PerToken1);
  }, [info.token0PerToken1]);

  const token1PerToken0Display = useMemo(() => {
    return TokenUtils.toNumberDisplay(info.token1PerToken0);
  }, [info.token1PerToken0]);

  const shareDisplay = useMemo(() => {
    if (!info.share) {
      return '0%';
    }
    const result = new BigNumber(info.share).precision(2);
    if (result.lt('0.01')) {
      return '<0.01%';
    }
    return `${result.toFixed()}%`;
  }, [info.share]);

  return (
    <div className={`liquidity-info-wrapper ${loading ? 'loading' : ''}`}>
      <p>{t('Prices and pool share')}</p>
      <div className="liquidity-info">
        <div className="liquidity-info__item">
          <p>{token1PerToken0Display}</p>
          <label className="small">
            <Trans>
              {{ symbol0: input1.token?.symbol }} per {{ symbol1: input0.token?.symbol }}
            </Trans>
          </label>
        </div>
        <div className="liquidity-info__item">
          <p>{token0PerToken1Display}</p>
          <label className="small">
            <Trans>
              {{ symbol0: input0.token?.symbol }} per {{ symbol1: input1.token?.symbol }}
            </Trans>
          </label>
        </div>
        <div className="liquidity-info__item">
          <p>{shareDisplay}</p>
          <label className="small">{t('Share of Pool')}</label>
        </div>
      </div>
    </div>
  );
}

export default LiquidityInfo;
