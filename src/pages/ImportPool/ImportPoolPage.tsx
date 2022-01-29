import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { WalletStatus } from 'types/walletAdapterInterface';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import DexForm from 'components/DexForm';
import ChevronDownIcon from 'components/Icons/ChevronDownIcon';
import { useModal } from 'components/Modal';
import SelectWalletModal, { SelectWalletModalOptions } from 'components/Modals/SelectWalletModal';
import TokenInput from 'components/TokenInput';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  resetLiquidity,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityPool,
  setLiquidityInput0Token,
  setLiquidityInput1Token,
  switchLiquidityTokens,
} from 'store/liquidity/liquiditySlice';
import { getLiquidityPool } from 'store/liquidity/liquidityThunks';
import { selectWalletConnectionStatus } from 'store/wallet/walletSlice';
import { walletImportLiquidity } from 'store/wallet/walletThunks';

import ArrowDownIcon from '../../components/Icons/ArrowDownIcon';
import PlusIcon from '../../components/Icons/PlusIcon';
import './ImportPoolPage.scss';

export function ImportPoolPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const pool = useAppSelector(selectLiquidityPool);

  const selectWalletModal = useModal(SelectWalletModal, SelectWalletModalOptions);

  const isFilled = useMemo(() => {
    return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1) && TokenUtils.isFilled(pool);
  }, [input0, input1, pool]);

  const importButtonText = useMemo(() => {
    if (!input0.token || !input1.token) {
      return t('Select a pair');
    }
    if (!TokenUtils.isFilled(input0) || !TokenUtils.isFilled(input1) || !TokenUtils.isFilled(pool)) {
      return t('You don’t have liquidity in this pool yet.');
    }
    return t('Import');
  }, [t, input0, input1, pool]);

  useEffect(() => {
    return () => {
      dispatch(resetLiquidity());
    };
  }, [dispatch]);

  useEffect(() => {
    if (input0.token && input1.token) {
      dispatch(
        getLiquidityPool({
          token0: input0.token.address,
          token1: input1.token.address,
        }),
      );
    }
  }, [dispatch, input0.token, input1.token]);

  const switchTokensHandler = useCallback(() => {
    dispatch(switchLiquidityTokens());
  }, [dispatch]);

  const selectTokenHandler = useCallback(
    (input, token) => {
      if (!token) {
        return;
      }
      if (input1.token && input === 'input0' && input1.token.symbol === token.symbol) {
        return switchTokensHandler();
      }
      if (input0.token && input === 'input1' && input0.token.symbol === token.symbol) {
        return switchTokensHandler();
      }
      if (input === 'input0') {
        return dispatch(setLiquidityInput0Token(token));
      }
      dispatch(setLiquidityInput1Token(token));
    },
    [dispatch, input0, input1, switchTokensHandler],
  );

  const importHandler = useCallback(() => {
    dispatch(walletImportLiquidity());
    navigate('/pool');
  }, [dispatch, navigate]);

  return (
    <DexForm
      backLink={'/pool'}
      header={t('Import Pool')}
      headerTooltip={t("Use this tool to find pools that don't automatically appear in the interface.")}
      subheader={t('Import an existing pool')}
      content={
        <>
          <TokenInput
            label={t('Input')}
            token={input0.token}
            value={input0.amount}
            showMax={false}
            showBalance={false}
            selectable={true}
            editable={false}
            onSelect={selectTokenHandler.bind(null, 'input0')}
          />
          <Button variant={'default'} size={'small'} icon={<PlusIcon />} />
          <TokenInput
            label={t('Input')}
            token={input1.token}
            value={input1.amount}
            showMax={false}
            showBalance={false}
            selectable={true}
            editable={false}
            onSelect={selectTokenHandler.bind(null, 'input1')}
          />
          {pool.token && (
            <>
              <Button variant={'default'} size={'small'} icon={<ArrowDownIcon />} />
              <TokenInput
                label={t('Output')}
                token={pool.token}
                value={pool.amount}
                showMax={false}
                showBalance={false}
                selectable={false}
                editable={false}
              />
            </>
          )}
        </>
      }
      actions={
        <>
          {walletConnectionStatus === WalletStatus.CONNECTED && (
            <Button variant={'primary'} disabled={!isFilled} onClick={importHandler}>
              {importButtonText}
            </Button>
          )}
          {walletConnectionStatus === WalletStatus.CONNECTED && !isFilled && input0.token && input1.token && (
            <Button
              variant={'primary'}
              onClick={navigate.bind(null, `/pool/add/${input0.token.address}/${input1.token.address}`)}
            >
              {t('Add Liquidity')}
            </Button>
          )}
          {walletConnectionStatus !== WalletStatus.CONNECTED && (
            <Button variant={'secondary'} onClick={selectWalletModal.open}>
              {t('Connect Wallet')}
            </Button>
          )}
        </>
      }
    />
  );
}

export default ImportPoolPage;
