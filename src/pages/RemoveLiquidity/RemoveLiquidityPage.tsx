import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { TxStatus } from 'types/transactionInterfaces';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import DexForm from 'components/DexForm';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import InputSlider from 'components/InputSlider';
import { useModal } from 'components/Modal';
import TransactionModal, { TransactionModalOptions } from 'components/Modals/TransactionModal';
import TokenInput from 'components/TokenInput';

import LiquidityInfo from 'pages/AddLiquidity/LiquidityInfo';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  resetLiquidity,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityPool,
  selectLiquidityRemoveApproveTx,
  setLiquidityInput0RemoveAmount,
  setLiquidityInput1RemoveAmount,
  setLiquidityPercentRemoveAmount,
  setLiquidityPoolRemoveAmount,
} from 'store/liquidity/liquiditySlice';
import { approveRemove, getLiquidityPool } from 'store/liquidity/liquidityThunks';
import { resetTransaction, selectWalletAdapter, selectWalletTransaction } from 'store/wallet/walletSlice';
import { getWalletBalance, getWalletUseTokenPermission } from 'store/wallet/walletThunks';

import RemoveLiquidityConfirm, { RemoveLiquidityConfirmOptions } from './RemoveLiquidityConfirm';
import './RemoveLiquidityPage.scss';

export function RemoveLiquidityPage() {
  const dispatch = useAppDispatch();
  const { token0, token1 } = useParams();
  const { t } = useTranslation();

  const walletAdapter = useAppSelector(selectWalletAdapter);
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);
  const removeApproveTx = useAppSelector(selectLiquidityRemoveApproveTx);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const removeLiquidityConfirmModal = useModal(RemoveLiquidityConfirm, RemoveLiquidityConfirmOptions);
  const transactionModal = useModal(TransactionModal, TransactionModalOptions);

  removeLiquidityConfirmModal.onClose((result: boolean) => {
    if (result) {
      transactionModal.open();
    }
  });

  transactionModal.onClose(() => {
    dispatch(resetTransaction());
    if (walletTransaction.status === TxStatus.CONFIRMED) {
      dispatch(
        getLiquidityPool({
          token0: input0.token.address,
          token1: input1.token.address,
        }),
      );
    }
  });

  const isFilled = useMemo(() => {
    return TokenUtils.isRemoveFilled(input0) && TokenUtils.isRemoveFilled(input1) && TokenUtils.hasRemoveAmount(pool);
  }, [input0, input1, pool]);

  const removePercent = useMemo(() => {
    if (!pool.removeAmount) {
      return '0';
    }
    const percent = new BigNumber(pool.removeAmount).div(pool.amount).multipliedBy('100');
    if (percent.gt('100') || percent.isNaN()) {
      return '0';
    }
    return percent.toFixed(0);
  }, [pool]);

  const removeButtonText = useMemo(() => {
    if (!TokenUtils.isRemoveFilled(input0) || !TokenUtils.isRemoveFilled(input1) || !TokenUtils.hasRemoveAmount(pool)) {
      return t('Enter an amount');
    }
    return t('Remove');
  }, [t, input0, input1, pool]);

  useEffect(() => {
    return () => {
      dispatch(resetLiquidity());
    };
  }, [dispatch]);

  useEffect(() => {
    if (token0 && token1) {
      dispatch(
        getLiquidityPool({
          token0: token0,
          token1: token1,
        }),
      );
    }
  }, [dispatch, token0, token1]);

  //Update balance and check token permissions on token0 update
  useEffect(() => {
    if (walletAdapter && input0.token) {
      dispatch(getWalletBalance(input0.token));
      dispatch(getWalletUseTokenPermission(input0.token));
    }
  }, [dispatch, input0.token, walletAdapter]);

  const inputSliderChangeHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityPercentRemoveAmount({
          value,
        }),
      );
    },
    [dispatch],
  );

  const token0AmountHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityInput0RemoveAmount({
          value,
        }),
      );
    },
    [dispatch],
  );

  const token1AmountHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityInput1RemoveAmount({
          value,
        }),
      );
    },
    [dispatch],
  );

  const poolTokenAmountHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityPoolRemoveAmount({
          value,
        }),
      );
    },
    [dispatch],
  );

  const approveHandler = useCallback(() => {
    dispatch(approveRemove(pool));
  }, [dispatch, pool]);

  return (
    <>
      <DexForm
        backLink={'/pool'}
        header={t('Remove Liquidity')}
        headerTooltip={t(
          'Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.',
        )}
        subheader={
          <Trans>
            To receive {{ symbol0: input0.token?.symbol }} and {{ symbol1: input1.token?.symbol }}
          </Trans>
        }
        content={
          <>
            <InputSlider value={removePercent} pnChange={inputSliderChangeHandler} />
            <TokenInput
              token={pool.token}
              balance={pool.amount}
              value={pool.removeAmount}
              showMax={true}
              onChange={poolTokenAmountHandler}
              selectable={false}
              editable={true}
            />
            <div className="btn-icon">
              <ChevronDownIcon />
            </div>
            <TokenInput
              token={input0.token}
              value={input0.removeAmount}
              balance={input0.amount}
              showMax={true}
              onChange={token0AmountHandler}
              selectable={false}
              editable={true}
            />
            <div className="btn-icon">+</div>
            <TokenInput
              token={input1.token}
              value={input1.removeAmount}
              balance={input1.amount}
              showMax={true}
              onChange={token1AmountHandler}
              selectable={false}
              editable={true}
            />
            <LiquidityInfo />
          </>
        }
        actions={
          <div className="actions-wrapper">
            {walletAdapter && (
              <Button
                variant={'primary'}
                className={'remove__btn'}
                disabled={!isFilled || [TxStatus.PENDING, TxStatus.CONFIRMED].indexOf(removeApproveTx.status) > -1}
                onClick={approveHandler}
              >
                {t('Approve')}
              </Button>
            )}
            {walletAdapter && (
              <Button
                variant={'primary'}
                className={'remove__btn'}
                disabled={!isFilled || removeApproveTx.status !== TxStatus.CONFIRMED}
                onClick={removeLiquidityConfirmModal.open}
              >
                {removeButtonText}
              </Button>
            )}
          </div>
        }
      />
    </>
  );
}

export default RemoveLiquidityPage;
