import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DEFAULT_SLIPPAGE } from 'constants/swap';

import { TxStatus } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import Modal from 'components/Modal';
import Spinner from 'components/Spinner';
import TokenInput from 'components/TokenInput';

import { selectSettings } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  resetLiquidity,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityPool,
} from 'store/liquidity/liquiditySlice';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/walletSlice';
import { walletAddLiquidity } from 'store/wallet/walletThunks';

import './AddLiquidityConfirm.scss';
import LiquidityInfo from './LiquidityInfo';

interface AddLiquidityConfirmProps {
  onClose: () => void;
}

function AddLiquidityConfirm({ onClose }: AddLiquidityConfirmProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);
  const settings = useAppSelector(selectSettings);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const modalClassName = useMemo(() => {
    return walletTransaction.status !== TxStatus.INITIAL
      ? 'add-liquidity-confirm-modal mini'
      : 'add-liquidity-confirm-modal';
  }, [walletTransaction]);

  const token0Display = useMemo(() => {
    return TokenUtils.toDisplay(input0);
  }, [input0]);

  const token1Display = useMemo(() => {
    return TokenUtils.toDisplay(input1);
  }, [input1]);

  const poolDisplay = useMemo(() => {
    return TokenUtils.toDisplay(pool);
  }, [pool]);

  const handleConfirmSupply = useCallback(() => {
    dispatch(walletAddLiquidity());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(resetTransaction());
    if (walletTransaction.status === TxStatus.CONFIRMED) {
      dispatch(resetLiquidity());
    }
    onClose && onClose();
  }, [dispatch, walletTransaction, onClose]);

  return (
    <Modal className={modalClassName} onClose={handleClose}>
      {walletTransaction.status === TxStatus.INITIAL && (
        <>
          <h4>{t('Confirm Supply')}</h4>
          <div className="add-liquidity-confirm-wrapper">
            <TokenInput token={input0.token} value={input0.amount} showMax={true} selectable={false} editable={false} />
            <div className="btn-icon">+</div>
            <TokenInput
              token={input1.token}
              value={input1.amount}
              showMax={false}
              selectable={false}
              editable={false}
            />
            <LiquidityInfo />
            <div className="pool-tokens-info">
              <span>{t('You will receive')} </span>
              <span className="text-semibold">{poolDisplay}</span>
              <span>
                {' '}
                {input0.token!.symbol}/{input1.token!.symbol} {t('Pool Tokens')}
              </span>
            </div>
            {
              <span className="help-text text-small">
                <Trans>
                  Output is estimated. If the price changes by more than{' '}
                  {{ slippage: settings.slippage || DEFAULT_SLIPPAGE }}% your transaction will revert.
                </Trans>
              </span>
            }
            <Button variant={'primary'} className={'supply__btn'} onClick={handleConfirmSupply}>
              {t('Confirm Supply')}
            </Button>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.PENDING && (
        <>
          <div className="add-liquidity-confirm-wrapper">
            <div className="add-liquidity-status">
              <Spinner />
              <span>
                <Trans>
                  Supplying {{ token0: token0Display }} {{ symbol0: input0.token!.symbol }} and{' '}
                  {{ token1: token1Display }} {{ symbol1: input1.token!.symbol }}
                </Trans>
              </span>
              <span className="text-small">{t('Confirm this transaction in your wallet')}</span>
            </div>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.CONFIRMED && (
        <>
          <div className="add-liquidity-confirm-wrapper">
            <div className="add-liquidity-status">
              <h2 className="text-semibold">{t('Transaction submitted')}</h2>
              <a>{t('View on Explorer')}</a>
              <Button variant={'primary'} className={'supply__btn'} onClick={handleClose}>
                {t('Close')}
              </Button>
            </div>
          </div>
        </>
      )}
      {walletTransaction.status === TxStatus.REJECTED && (
        <>
          <h4 className="text-error">{t('Error')}</h4>
          <div className="add-liquidity-confirm-wrapper">
            <div className="add-liquidity-status">
              <h2 className="text-semibold text-error">{t('Transaction rejected')}</h2>
              <Button variant={'primary'} className={'supply__btn'} onClick={handleClose}>
                {t('Dismiss')}
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

export default AddLiquidityConfirm;
