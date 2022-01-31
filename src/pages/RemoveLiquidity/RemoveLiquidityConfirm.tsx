import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DEFAULT_SLIPPAGE } from 'constants/swap';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import TokenIcon from 'components/TokenIcon';

import { selectSettings } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  selectLiquidityInfo,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityPool,
} from 'store/liquidity/liquiditySlice';
import { walletRemoveLiquidity } from 'store/wallet/walletThunks';

import './RemoveLiquidityConfirm.scss';

interface RemoveLiquidityConfirmProps {
  onClose: (result?: boolean) => void;
}

export const RemoveLiquidityConfirmOptions = {
  header: 'Confirm Remove Liquidity',
  className: 'remove-liquidity-confirm-modal',
};

function RemoveLiquidityConfirm({ onClose }: RemoveLiquidityConfirmProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);
  const settings = useAppSelector(selectSettings);
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

  const poolRemoveDisplay = useMemo(() => {
    return TokenUtils.toNumberDisplay(pool.removeAmount);
  }, [pool]);

  const confirmRemoveHandler = useCallback(() => {
    dispatch(walletRemoveLiquidity({ input0, input1, pool }));
    onClose && onClose(true);
  }, [dispatch]);

  return (
    <div className="remove-liquidity-confirm-wrapper">
      <div className="remove-liquidity-list">
        <div className="remove-liquidity-list-item">
          <div className="title-2">{t('Input')}</div>
          <div className="remove-liquidity-item-token">
            <div className="title-2">
              {TokenUtils.toNumberDisplay(input0.removeAmount)} {input0.token.symbol}
            </div>
            <TokenIcon address={input0.token.address} name={input0.token.name} url={input0.token.logoURI} />
          </div>
        </div>
        <div className="remove-liquidity-list-item">
          <div className="title-2">{t('Input')}</div>
          <div className="remove-liquidity-item-token">
            <div className="title-2">
              {TokenUtils.toNumberDisplay(input1.removeAmount)} {input1.token.symbol}
            </div>
            <TokenIcon address={input1.token.address} name={input1.token.name} url={input1.token.logoURI} />
          </div>
        </div>
      </div>
      <label className="help-text small">
        <Trans>
          Output is estimated. If the price changes by more than{' '}
          <label className="large">{{ slippage: settings.slippage || DEFAULT_SLIPPAGE }}%</label> your transaction will
          revert.
        </Trans>
      </label>
      <div className="remove-liquidity-info">
        <div className="remove-liquidity-info__item">
          <p>
            {input0.token.symbol}/{input1.token.symbol} {t('Burned')}
          </p>
          <p className="remove-liquidity-pool__tokens">
            {poolRemoveDisplay}
            <TokenIcon address={input0.token.address} name={input0.token.name} url={input0.token.logoURI} />
            <TokenIcon address={input1.token.address} name={input1.token.name} url={input1.token.logoURI} />
          </p>
        </div>
        <div className="remove-liquidity-info__item">
          <p>{t('Price')}</p>
          <p className="remove-liquidity-pool__price">
            <p>
              <Trans>
                {token1PerToken0Display} {{ symbol0: input1.token.symbol }} per 1 {{ symbol1: input0.token.symbol }}
              </Trans>
            </p>
            <p>
              <Trans>
                {token0PerToken1Display} {{ symbol0: input0.token.symbol }} per 1 {{ symbol1: input1.token.symbol }}
              </Trans>
            </p>
          </p>
        </div>
        <div className="remove-liquidity-info__item">
          <p>{t('Share of Pool')}</p>
          <p className="remove-liquidity-pool__share">{shareDisplay}</p>
        </div>
      </div>
      <Button variant={'primary'} onClick={confirmRemoveHandler}>
        {t('Confirm Remove Liquidity')}
      </Button>
    </div>
  );
}

export default RemoveLiquidityConfirm;
