import React, { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { DEFAULT_SLIPPAGE } from 'constants/swap';

import { TxStatus } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import Modal from 'components/Modal';
import Spinner from 'components/Spinner';
import TokenInput from 'components/TokenInput';

import LiquidityInfo from 'pages/AddLiquidity/LiquidityInfo';

import { selectSettings } from 'store/app/appSlice';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectLiquidityInput0, selectLiquidityInput1, selectLiquidityPool } from 'store/liquidity/liquiditySlice';
import { getLiquidityPool } from 'store/liquidity/liquidityThunks';
import { resetTransaction, selectWalletTransaction } from 'store/wallet/walletSlice';
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

  const poolRemoveDisplay = useMemo(() => {
    return TokenUtils.toNumberDisplay(pool.removeAmount!);
  }, [pool]);

  const handleConfirmRemove = useCallback(() => {
    dispatch(walletRemoveLiquidity({ input0, input1, pool }));
    onClose && onClose(true);
  }, [dispatch]);

  return (
    <div className="remove-liquidity-confirm-wrapper">
      <span>{t('You will receive')}</span>
      <TokenInput token={input0.token} value={input0.removeAmount} showMax={true} selectable={false} editable={false} />
      <div className="btn-icon">+</div>
      <TokenInput
        token={input1.token}
        value={input1.removeAmount}
        showMax={false}
        selectable={false}
        editable={false}
      />
      <LiquidityInfo />
      <div className="pool-tokens-info">
        <Trans>
          <span>You will burn </span>
          <span className="text-semibold">{{ amount: poolRemoveDisplay }}</span>
          <span>
            {' '}
            {{ symbol0: input0.token.symbol }}/{{ symbol1: input1.token.symbol }} Pool Tokens
          </span>
        </Trans>
      </div>
      <span className="help-text text-small">
        <Trans>
          Output is estimated. If the price changes by more than {{ slippage: settings.slippage || DEFAULT_SLIPPAGE }}%
          your transaction will revert.
        </Trans>
      </span>
      <Button variant={'primary'} className={'remove__btn'} onClick={handleConfirmRemove}>
        {t('Confirm Remove Liquidity')}
      </Button>
    </div>
  );
}

export default RemoveLiquidityConfirm;
