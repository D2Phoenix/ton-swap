import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { TxStatus } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import Spinner from 'components/Spinner';

import { useAppSelector } from 'store/hooks';
import { selectSwapInput0, selectSwapInput1 } from 'store/swap/swapSlice';
import { selectWalletTransaction } from 'store/wallet/walletSlice';

import './TransactionModal.scss';

export const TransactionModalOptions = {
  header: '',
  className: 'transaction-modal',
};

export function TransactionModal() {
  const { t } = useTranslation();
  const input0 = useAppSelector(selectSwapInput0);
  const input1 = useAppSelector(selectSwapInput1);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const token0Amount = useMemo(() => {
    return TokenUtils.toDisplay(input1);
  }, [input1]);

  const token1Amount = useMemo(() => {
    return TokenUtils.toDisplay(input0);
  }, [input0]);

  return (
    <div className="swap-confirm-wrapper">
      <div className="swap-status">
        <Spinner status={walletTransaction.status} />
        {walletTransaction.status === TxStatus.PENDING && (
          <>
            <h5>{t('Waiting for confirmation')}</h5>
            <p>
              <Trans>
                Swapping {{ amount0: token1Amount }} {{ symbol0: input0.token.symbol }} for {{ amount1: token0Amount }}{' '}
                {{ symbol1: input1.token.symbol }}
              </Trans>
            </p>
            <label className="small">{t('Confirm this transaction in your wallet')}</label>
          </>
        )}
        {walletTransaction.status === TxStatus.CONFIRMED && (
          <>
            <h5>{t('Transaction submitted')}</h5>
            <Button type={'default'} className="medium">
              {t('View on Explorer')}
            </Button>
          </>
        )}
        {walletTransaction.status === TxStatus.REJECTED && <h5>{t('Transaction rejected')}</h5>}
      </div>
    </div>
  );
}
