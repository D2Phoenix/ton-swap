import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { TxStatus, TxType } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import Spinner from 'components/Spinner';

import { useAppSelector } from 'store/hooks';
import { selectWalletTransaction } from 'store/wallet/walletSlice';

import './TransactionModal.scss';

export const TransactionModalOptions = {
  header: '',
  className: 'transaction-modal',
};

export function TransactionModal() {
  const { t } = useTranslation();
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const token0Amount = useMemo(() => {
    if (walletTransaction.type === TxType.BURN) {
      return TokenUtils.toNumberDisplay(walletTransaction.input0.removeAmount!);
    }
    return TokenUtils.toDisplay(walletTransaction.input0);
  }, [walletTransaction]);

  const token1Amount = useMemo(() => {
    if (walletTransaction.type === TxType.BURN) {
      return TokenUtils.toNumberDisplay(walletTransaction.input1.removeAmount!);
    }
    return TokenUtils.toDisplay(walletTransaction.input1);
  }, [walletTransaction]);

  return (
    <div className="swap-confirm-wrapper">
      <div className="swap-status">
        <Spinner status={walletTransaction.status} />
        {walletTransaction.status === TxStatus.PENDING && (
          <>
            <h5>{t('Waiting for confirmation')}</h5>
            <p>
              {walletTransaction.type === TxType.SWAP && (
                <Trans>
                  Swapping {{ amount0: token0Amount }} {{ symbol0: walletTransaction.input0.token.symbol }} for{' '}
                  {{ amount1: token1Amount }} {{ symbol1: walletTransaction.input1.token.symbol }}
                </Trans>
              )}
              {walletTransaction.type === TxType.MINT && (
                <Trans>
                  Supplying {{ token0: token0Amount }} {{ symbol0: walletTransaction.input0.token.symbol }} and{' '}
                  {{ token1: token1Amount }} {{ symbol1: walletTransaction.input1.token.symbol }}
                </Trans>
              )}
              {walletTransaction.type === TxType.BURN && (
                <Trans>
                  Removing {{ amount0: token0Amount }} {{ symbol0: walletTransaction.input0.token.symbol }} and{' '}
                  {{ amount1: token1Amount }} {{ symbol1: walletTransaction.input1.token.symbol }}
                </Trans>
              )}
            </p>
            <label className="small">{t('Confirm this transaction in your wallet')}</label>
          </>
        )}
        {walletTransaction.status === TxStatus.CONFIRMED && (
          <>
            <h5>{t('Transaction submitted')}</h5>
            <Button variant={'default'} className="medium">
              {t('View on Explorer')}
            </Button>
          </>
        )}
        {walletTransaction.status === TxStatus.REJECTED && <h5>{t('Transaction rejected')}</h5>}
      </div>
    </div>
  );
}
