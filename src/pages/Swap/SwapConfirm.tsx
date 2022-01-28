import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import SwapIcon from 'components/Icons/SwapIcon';
import TokenIcon from 'components/TokenIcon';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSwapInput0, selectSwapInput1, selectSwapTrade } from 'store/swap/swapSlice';
import { walletSwap } from 'store/wallet/walletThunks';

import './SwapConfirm.scss';
import SwapInfo from './SwapInfo';

interface SwapConfirmProps {
  onClose: (result?: boolean) => void;
}

export const SwapConfirmOptions = {
  header: 'Confirm Swap',
  className: 'swap-confirm-modal',
};

function SwapConfirm({ onClose }: SwapConfirmProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const input0 = useAppSelector(selectSwapInput0);
  const input1 = useAppSelector(selectSwapInput1);
  const trade = useAppSelector(selectSwapTrade);

  const tokenSwapRate = useMemo(() => {
    return TokenUtils.toNumberDisplay(trade.rate);
  }, [trade]);

  const handleConfirmSwap = useCallback(() => {
    dispatch(walletSwap());
    onClose(true);
  }, [dispatch, onClose]);

  return (
    <div className="swap-confirm-wrapper">
      <div className="swap-list">
        <div className="swap-list-item">
          <div className="title-2">{t('From')}</div>
          <div className="swap-item-token">
            <div className="title-2">
              {TokenUtils.toNumberDisplay(input0.amount)} {input0.token.symbol}
            </div>
            <TokenIcon address={input0.token.address} name={input0.token.name} url={input0.token.logoURI} />
          </div>
        </div>
        <div className="swap-list-item">
          <div className="title-2">{t('To')}</div>
          <div className="swap-item-token">
            <div className="title-2">
              {TokenUtils.toNumberDisplay(input1.amount)} {input1.token.symbol}
            </div>
            <TokenIcon address={input1.token.address} name={input1.token.name} url={input1.token.logoURI} />
          </div>
        </div>
      </div>
      {trade.minimumReceived && (
        <label className="help-text small">
          <Trans>
            Output is estimated. You will receive at least{' '}
            <label className="large">
              {{ amount0: TokenUtils.toNumberDisplay(trade.minimumReceived) }} {{ symbol0: input1.token.symbol }}
            </label>{' '}
            or the transaction will revert.
          </Trans>
        </label>
      )}
      {trade.maximumSent && (
        <label className="help-text small">
          <Trans>
            Input is estimated. You will sell at most{' '}
            <label className="large">
              {{ amount0: TokenUtils.toNumberDisplay(trade.maximumSent) }} {{ symbol0: input0.token.symbol }}
            </label>{' '}
            or the transaction will revert.
          </Trans>
        </label>
      )}
      <div className="swap-info">
        <div className="swap-price">
          <p>{t('Price')}</p>
          <p className="swap-price-text">
            {tokenSwapRate} {input0.token.symbol} per 1 {input1.token.symbol}
          </p>
          <SwapIcon />
        </div>
        <SwapInfo />
      </div>
      <Button variant={'primary'} onClick={handleConfirmSwap}>
        {t('Confirm Swap')}
      </Button>
    </div>
  );
}

export default SwapConfirm;
