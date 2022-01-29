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
  selectLiquidityInfo,
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

import ArrowDownIcon from '../../components/Icons/ArrowDownIcon';
import PlusIcon from '../../components/Icons/PlusIcon';
import Tag from '../../components/Tag';
import TokenIcon from '../../components/TokenIcon';
import RemoveLiquidityConfirm, { RemoveLiquidityConfirmOptions } from './RemoveLiquidityConfirm';
import './RemoveLiquidityPage.scss';

export function RemoveLiquidityPage() {
  const dispatch = useAppDispatch();
  const { token0, token1 } = useParams();
  const { t } = useTranslation();

  const [isDetailed, setIsDetailed] = useState(false);

  const walletAdapter = useAppSelector(selectWalletAdapter);
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);
  const removeApproveTx = useAppSelector(selectLiquidityRemoveApproveTx);
  const walletTransaction = useAppSelector(selectWalletTransaction);
  const info = useAppSelector(selectLiquidityInfo);

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

  const token0PerToken1Display = useMemo(() => {
    return TokenUtils.toNumberDisplay(info.token0PerToken1);
  }, [info.token0PerToken1]);

  const token1PerToken0Display = useMemo(() => {
    return TokenUtils.toNumberDisplay(info.token1PerToken0);
  }, [info.token1PerToken0]);

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

  const detailedHandler = useCallback(() => {
    setIsDetailed((value) => !value);
  }, []);

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
            {!isDetailed && (
              <div className="remove-liquidity">
                <div className="remove-liquidity__header">
                  <p>{t('Amount')}</p>
                  <Button variant={'default'} size={'medium'} onClick={detailedHandler}>
                    {t('Detailed')}
                  </Button>
                </div>
                <h3>{removePercent}%</h3>
                <div className="remove-liquidity__tags">
                  <Tag selected={removePercent === '25'} onClick={inputSliderChangeHandler.bind(null, '25')}>
                    25%
                  </Tag>
                  <Tag selected={removePercent === '50'} onClick={inputSliderChangeHandler.bind(null, '50')}>
                    50%
                  </Tag>
                  <Tag selected={removePercent === '75'} onClick={inputSliderChangeHandler.bind(null, '75')}>
                    75%
                  </Tag>
                  <Tag selected={removePercent === '100'} onClick={inputSliderChangeHandler.bind(null, '100')}>
                    Max
                  </Tag>
                </div>
                <InputSlider value={removePercent} pnChange={inputSliderChangeHandler} />
                <div className="remove-liquidity__list">
                  <div className="remove-liquidity__list-item">
                    <p>{t('You will receive')}</p>
                    <div className="remove-liquidity__item-token">
                      <p>
                        {TokenUtils.toNumberDisplay(input0.removeAmount)} {input0.token?.symbol}
                      </p>
                      <TokenIcon
                        address={input0.token?.address}
                        name={input0.token?.name}
                        url={input0.token?.logoURI}
                      />
                    </div>
                  </div>
                  <div className="remove-liquidity__list-item">
                    <p />
                    <div className="remove-liquidity__item-token">
                      <p>
                        {TokenUtils.toNumberDisplay(input1.removeAmount)} {input1.token?.symbol}
                      </p>
                      <TokenIcon
                        address={input1.token?.address}
                        name={input1.token?.name}
                        url={input1.token?.logoURI}
                      />
                    </div>
                  </div>
                </div>
                <div className="remove-liquidity__price">
                  <p>{t('Price')}</p>
                  <p>
                    <p>
                      <Trans>
                        {token1PerToken0Display} {{ symbol0: input1.token?.symbol }} per 1{' '}
                        {{ symbol1: input0.token?.symbol }}
                      </Trans>
                    </p>
                    <p>
                      <Trans>
                        {token0PerToken1Display} {{ symbol0: input0.token?.symbol }} per 1{' '}
                        {{ symbol1: input1.token?.symbol }}
                      </Trans>
                    </p>
                  </p>
                </div>
              </div>
            )}
            {isDetailed && (
              <div className="remove-liquidity">
                <div className="remove-liquidity__header">
                  <p>{t('Amount')}</p>
                  <Button variant={'default'} size={'medium'} onClick={detailedHandler}>
                    {t('Simple')}
                  </Button>
                </div>
                <h3>{removePercent}%</h3>
                <TokenInput
                  label={t('Output')}
                  token={pool.token}
                  balance={pool.amount}
                  value={pool.removeAmount}
                  showMax={true}
                  onChange={poolTokenAmountHandler}
                  selectable={false}
                  editable={true}
                />
                <Button variant={'default'} size={'small'} icon={<ArrowDownIcon />} />
                <TokenInput
                  label={t('Input')}
                  token={input0.token}
                  value={input0.removeAmount}
                  balance={input0.amount}
                  showMax={true}
                  onChange={token0AmountHandler}
                  selectable={false}
                  editable={true}
                />
                <Button variant={'default'} size={'small'} icon={<PlusIcon />} />
                <TokenInput
                  label={t('Input')}
                  token={input1.token}
                  value={input1.removeAmount}
                  balance={input1.amount}
                  showMax={true}
                  onChange={token1AmountHandler}
                  selectable={false}
                  editable={true}
                />
                <div className="remove-liquidity__price">
                  <p>{t('Price')}</p>
                  <p>
                    <p>
                      <Trans>
                        {token1PerToken0Display} {{ symbol0: input1.token?.symbol }} per 1{' '}
                        {{ symbol1: input0.token?.symbol }}
                      </Trans>
                    </p>
                    <p>
                      <Trans>
                        {token0PerToken1Display} {{ symbol0: input0.token?.symbol }} per 1{' '}
                        {{ symbol1: input1.token?.symbol }}
                      </Trans>
                    </p>
                  </p>
                </div>
              </div>
            )}
          </>
        }
        actions={
          <div className="remove-liquidity__actions">
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
