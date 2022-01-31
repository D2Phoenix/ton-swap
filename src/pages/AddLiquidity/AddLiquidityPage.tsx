import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';

import { EstimateTxType, TxStatus } from 'types/transactionInterfaces';
import { WalletStatus } from 'types/walletAdapterInterface';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import DexForm from 'components/DexForm';
import PlusIcon from 'components/Icons/PlusIcon';
import { useModal } from 'components/Modal';
import SelectWalletModal, { SelectWalletModalOptions } from 'components/Modals/SelectWalletModal';
import TransactionModal, { TransactionModalOptions } from 'components/Modals/TransactionModal';
import TokenInput from 'components/TokenInput';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  resetLiquidity,
  selectLiquidityInput0,
  selectLiquidityInput1,
  selectLiquidityLoading,
  selectLiquidityTxType,
  setLiquidityInput0Amount,
  setLiquidityInput0Token,
  setLiquidityInput1Amount,
  setLiquidityInput1Token,
  switchLiquidityTokens,
} from 'store/liquidity/liquiditySlice';
import {
  estimateLiquidityTransaction,
  getLiquidityPoolToken,
  getLiquidityToken,
} from 'store/liquidity/liquidityThunks';
import {
  resetTransaction,
  selectWalletAdapter,
  selectWalletBalances,
  selectWalletConnectionStatus,
  selectWalletPermissions,
  selectWalletTransaction,
} from 'store/wallet/walletSlice';
import { getWalletBalance, getWalletUseTokenPermission, setWalletUseTokenPermission } from 'store/wallet/walletThunks';

import AddLiquidityConfirm, { AddLiquidityConfirmOptions } from './AddLiquidityConfirm';
import './AddLiquidityPage.scss';
import LiquidityInfo from './LiquidityInfo';

export function AddLiquidityPage() {
  const dispatch = useAppDispatch();
  const { token0, token1 } = useParams();
  const { t } = useTranslation();

  const walletAdapter = useAppSelector(selectWalletAdapter);
  const walletBalances = useAppSelector(selectWalletBalances);
  const walletPermissions = useAppSelector(selectWalletPermissions);
  const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
  const input0 = useAppSelector(selectLiquidityInput0);
  const input1 = useAppSelector(selectLiquidityInput1);
  const txType = useAppSelector(selectLiquidityTxType);
  const loading = useAppSelector(selectLiquidityLoading);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const addLiquidityConfirmModal = useModal(AddLiquidityConfirm, AddLiquidityConfirmOptions);
  const transactionModal = useModal(TransactionModal, TransactionModalOptions);
  const selectWalletModal = useModal(SelectWalletModal, SelectWalletModalOptions);

  addLiquidityConfirmModal.onClose((result: boolean) => {
    if (result) {
      transactionModal.open();
    }
  });

  transactionModal.onClose(() => {
    dispatch(resetTransaction());
    if (walletTransaction.status === TxStatus.CONFIRMED) {
      dispatch(resetLiquidity());
    }
  });

  const isFilled = useMemo(() => {
    return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1);
  }, [input0, input1]);

  const insufficientToken0Balance = useMemo(() => {
    if (TokenUtils.isFilled(input0)) {
      return TokenUtils.compareAmount(input0, walletBalances[input0.token.symbol]) === 1;
    }
    return false;
  }, [input0, walletBalances]);

  const insufficientToken1Balance = useMemo(() => {
    if (TokenUtils.isFilled(input1)) {
      return TokenUtils.compareAmount(input1, walletBalances[input1.token.symbol]) === 1;
    }
    return false;
  }, [input1, walletBalances]);

  const insufficientBalance = useMemo(() => {
    return insufficientToken0Balance || insufficientToken1Balance;
  }, [insufficientToken0Balance, insufficientToken1Balance]);

  const supplyButtonText = useMemo(() => {
    if (!TokenUtils.isFilled(input0)) {
      return t('Enter an amount');
    }
    if (!input1.token || !input0.token) {
      return t('Invalid pair');
    }
    if (insufficientToken0Balance) {
      return t(`Insufficient {{symbol0}} balance`, { symbol0: input0.token.symbol });
    }
    if (insufficientToken1Balance) {
      return t(`Insufficient {{symbol0}} balance`, { symbol0: input1.token.symbol });
    }
    return t('Supply');
  }, [t, input0, input1, insufficientToken0Balance, insufficientToken1Balance]);

  useEffect(() => {
    return () => {
      dispatch(resetLiquidity());
    };
  }, [dispatch]);

  useEffect(() => {
    if (token0) {
      dispatch(getLiquidityToken({ address: token0, position: 'input0' }));
    }
    if (token1) {
      dispatch(getLiquidityToken({ address: token1, position: 'input1' }));
    }
  }, [dispatch, token0, token1]);

  useEffect(() => {
    if (input0.token && input1.token) {
      dispatch(getLiquidityPoolToken({ token0: input0.token, token1: input1.token }));
    }
  }, [dispatch, input0.token, input1.token]);

  // Estimate EXACT_IN transaction
  useEffect((): any => {
    if (txType === EstimateTxType.EXACT_IN && !TokenUtils.hasAmount(input0)) {
      return dispatch(
        setLiquidityInput1Amount({
          value: null,
          txType,
        }),
      );
    }
    if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
      return dispatch(
        estimateLiquidityTransaction({
          input: input0,
          token: input1.token,
          txType,
        }),
      );
    }
  }, [dispatch, input0, input1.token, txType]);

  // Estimate EXACT_OUT transaction
  useEffect((): any => {
    if (txType === EstimateTxType.EXACT_OUT && !TokenUtils.hasAmount(input1)) {
      return dispatch(
        setLiquidityInput0Amount({
          value: null,
          txType,
        }),
      );
    }
    if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
      return dispatch(
        estimateLiquidityTransaction({
          input: input1,
          token: input0.token,
          txType: EstimateTxType.EXACT_OUT,
        }),
      );
    }
  }, [dispatch, input0.token, input1, txType]);

  // Update balances and transaction estimation every {WALLET_TX_UPDATE_INTERVAL} milliseconds
  useEffect((): any => {
    if (!walletAdapter) {
      return;
    }
    const intervalId = setInterval(() => {
      if (input0.token) {
        dispatch(getWalletBalance(input0.token));
      }
      if (input1.token) {
        dispatch(getWalletBalance(input1.token));
      }
      if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
        dispatch(
          estimateLiquidityTransaction({
            input: input0,
            token: input1.token,
            txType,
            source: 'auto',
          }),
        );
      }
      if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
        dispatch(
          estimateLiquidityTransaction({
            input: input1,
            token: input0.token,
            txType,
            source: 'auto',
          }),
        );
      }
    }, WALLET_TX_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [dispatch, walletAdapter, input0, input1, txType]);

  //Update balance and check token permissions on token0 update
  useEffect(() => {
    if (walletAdapter && input0.token) {
      dispatch(getWalletBalance(input0.token));
      dispatch(getWalletUseTokenPermission(input0.token));
    }
  }, [dispatch, input0.token, walletAdapter]);

  //Update balance and check token permissions on token1 update
  useEffect(() => {
    if (walletAdapter && input1.token) {
      dispatch(getWalletBalance(input1.token));
      dispatch(getWalletUseTokenPermission(input1.token));
    }
  }, [dispatch, input1.token, walletAdapter]);

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

  const input0TokenAmountHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityInput0Amount({
          value,
          txType: EstimateTxType.EXACT_IN,
        }),
      );
    },
    [dispatch],
  );

  const input1TokenAmountHandler = useCallback(
    (value) => {
      dispatch(
        setLiquidityInput1Amount({
          value,
          txType: EstimateTxType.EXACT_OUT,
        }),
      );
    },
    [dispatch],
  );

  const allowUseToken0Handler = useCallback(() => {
    dispatch(setWalletUseTokenPermission(input0.token));
  }, [dispatch, input0]);

  const allowUseToken1Handler = useCallback(() => {
    dispatch(setWalletUseTokenPermission(input1.token));
  }, [dispatch, input1]);

  return (
    <DexForm
      backLink="/pool"
      header={t('Add Liquidity')}
      headerTooltip={t(
        'When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.',
      )}
      subheader={t('Add liquidity to receive LP tokens')}
      content={
        <>
          <TokenInput
            label={t('Input')}
            token={input0.token}
            balance={walletBalances[input0.token?.symbol || '']}
            balancesFirst={true}
            value={input0.amount}
            showMax={true}
            onSelect={selectTokenHandler.bind(null, 'input0')}
            onChange={input0TokenAmountHandler}
            selectable={true}
            editable={true}
            loading={txType === EstimateTxType.EXACT_OUT && loading}
            primary={txType === EstimateTxType.EXACT_IN}
          />
          <Button variant={'default'} size={'small'} icon={<PlusIcon />} />
          <TokenInput
            label={t('Input')}
            token={input1.token}
            balance={walletBalances[input1.token?.symbol || '']}
            balancesFirst={true}
            value={input1.amount}
            showMax={true}
            onSelect={selectTokenHandler.bind(null, 'input1')}
            onChange={input1TokenAmountHandler}
            selectable={true}
            editable={true}
            loading={txType === EstimateTxType.EXACT_IN && loading}
            primary={txType === EstimateTxType.EXACT_OUT}
          />
          {isFilled && <LiquidityInfo />}
        </>
      }
      actions={
        <>
          {walletConnectionStatus === WalletStatus.CONNECTED &&
            isFilled &&
            !walletPermissions[input0.token?.symbol] &&
            !insufficientToken0Balance && (
              <Button variant={'primary'} onClick={allowUseToken0Handler}>
                <Trans>Allow the TONSwap Protocol to use your {{ symbol0: input0.token.symbol }}</Trans>
              </Button>
            )}
          {walletConnectionStatus === WalletStatus.CONNECTED &&
            isFilled &&
            !walletPermissions[input1.token?.symbol] &&
            !insufficientToken1Balance && (
              <Button variant={'primary'} onClick={allowUseToken1Handler}>
                <Trans>Allow the TONSwap Protocol to use your {{ symbol0: input1.token.symbol }}</Trans>
              </Button>
            )}
          {walletConnectionStatus === WalletStatus.CONNECTED && (
            <Button
              variant={'primary'}
              disabled={
                !isFilled ||
                insufficientBalance ||
                (!!input0.token && !walletPermissions[input0.token.symbol]) ||
                (!!input1.token && !walletPermissions[input1.token.symbol]) ||
                loading
              }
              onClick={addLiquidityConfirmModal.open}
            >
              {supplyButtonText}
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

export default AddLiquidityPage;
