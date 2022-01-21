import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import './SwapConfirm.scss';
import Modal from 'components/Modal';
import TokenInput from 'components/TokenInput';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import ArrowDownIcon from '../../components/Icons/ArrowDownIcon';
import TokenIcon from '../../components/TokenIcon';
import { BALANCE_PRECISION } from '../../constants/swap';
import SwapInfo from './SwapInfo';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { resetSwap, selectSwapInput0, selectSwapInput1, selectSwapTrade } from 'store/swap/swapSlice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/walletSlice';
import { TxStatus } from 'types/transactionInterfaces';
import { walletSwap } from 'store/wallet/walletThunks';
import Spinner from 'components/Spinner';
import TokenUtils from 'utils/tokenUtils';
import Button from 'components/Button';

interface SwapConfirmProps {
  onClose: () => void;
}

function SwapConfirm({ onClose }: SwapConfirmProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const input0 = useAppSelector(selectSwapInput0);
  const input1 = useAppSelector(selectSwapInput1);
  const trade = useAppSelector(selectSwapTrade);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const tokenSwapRate = useMemo(() => {
    return TokenUtils.toNumberDisplay(trade.rate);
  }, [trade]);

  const token0Amount = useMemo(() => {
    return TokenUtils.toDisplay(input1);
  }, [input1]);

  const token1Amount = useMemo(() => {
    return TokenUtils.toDisplay(input0);
  }, [input0]);

  const handleConfirmSwap = useCallback(() => {
    dispatch(walletSwap());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(resetTransaction());
    if (walletTransaction.status === TxStatus.CONFIRMED) {
      dispatch(resetSwap());
    }
    onClose && onClose();
  }, [dispatch, walletTransaction, onClose]);

  return (
    <Modal className="swap-confirm-modal" header={t('Confirm Swap')} onClose={handleClose}>
      {walletTransaction.status === TxStatus.INITIAL && (
        <>
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
                <p>
                  {tokenSwapRate} {input0.token.symbol} per 1 {input1.token.symbol}
                </p>
              </div>
              <SwapInfo />
            </div>
            <Button type={'primary'} className={'large'} onClick={handleConfirmSwap}>
              {t('Confirm Swap')}
            </Button>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.PENDING && (
        <>
          <div className="swap-confirm-wrapper">
            <div className="swap-status">
              <Spinner />
              <h5>{t('Waiting for confirmation')}</h5>
              <p>
                <Trans>
                  Swapping {{ amount0: token1Amount }} {{ symbol0: input0.token.symbol }} for{' '}
                  {{ amount1: token0Amount }} {{ symbol1: input1.token.symbol }}
                </Trans>
              </p>
              <label className="small">{t('Confirm this transaction in your wallet')}</label>
            </div>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.CONFIRMED && (
        <>
          <div className="swap-confirm-wrapper">
            <div className="swap-status">
              <h5>{t('Transaction submitted')}</h5>
              <Button type={'default'} className="medium">
                {t('View on Explorer')}
              </Button>
              <Button type={'primary'} className={'swap__btn'} onClick={handleClose}>
                {t('Close')}
              </Button>
            </div>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.REJECTED && (
        <>
          <h4 className="text-error">{t('Error')}</h4>
          <div className="swap-confirm-wrapper">
            <div className="swap-status">
              <h2 className="text-semibold text-error">{t('Transaction rejected')}</h2>
              <Button type={'primary'} className={'swap__btn'} onClick={handleClose}>
                {t('Dismiss')}
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

export default SwapConfirm;
