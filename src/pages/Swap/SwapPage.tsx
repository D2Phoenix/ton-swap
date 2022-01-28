import React, { useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { WALLET_TX_UPDATE_INTERVAL } from 'constants/swap';

import { EstimateTxType, TxStatus } from 'types/transactionInterfaces';
import { WalletStatus } from 'types/walletAdapterInterface';

import TokenUtils from 'utils/tokenUtils';

import Button from 'components/Button';
import DexForm from 'components/DexForm';
import SwapIcon from 'components/Icons/SwapIcon';
import { useModal } from 'components/Modal';
import SelectWalletModal, { SelectWalletModalOptions } from 'components/Modals/SelectWalletModal';
import TransactionModal, { TransactionModalOptions } from 'components/Modals/TransactionModal';
import TokenInput from 'components/TokenInput';
import Tooltip from 'components/Tooltip';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  resetSwap,
  selectSwapInput0,
  selectSwapInput1,
  selectSwapLoading,
  selectSwapTrade,
  selectSwapTxType,
  setSwapInput0Amount,
  setSwapInput0Token,
  setSwapInput1Amount,
  setSwapInput1Token,
  switchSwapTokens,
} from 'store/swap/swapSlice';
import { estimateTransaction, getSwapToken } from 'store/swap/swapThunks';
import {
  resetTransaction,
  selectWalletAdapter,
  selectWalletBalances,
  selectWalletConnectionStatus,
  selectWalletPermissions,
  selectWalletTransaction,
} from 'store/wallet/walletSlice';
import { getWalletBalance, getWalletUseTokenPermission, setWalletUseTokenPermission } from 'store/wallet/walletThunks';

import SwapConfirm, { SwapConfirmOptions } from './SwapConfirm';
import SwapInfo from './SwapInfo';
import './SwapPage.scss';

function SwapPage() {
  const { t } = useTranslation();
  const { token0, token1 } = useParams();

  const dispatch = useAppDispatch();
  const input0 = useAppSelector(selectSwapInput0);
  const input1 = useAppSelector(selectSwapInput1);
  const txType = useAppSelector(selectSwapTxType);
  const trade = useAppSelector(selectSwapTrade);
  const loading = useAppSelector(selectSwapLoading);
  const walletBalances = useAppSelector(selectWalletBalances);
  const walletAdapter = useAppSelector(selectWalletAdapter);
  const walletConnectionStatus = useAppSelector(selectWalletConnectionStatus);
  const walletPermissions = useAppSelector(selectWalletPermissions);
  const walletTransaction = useAppSelector(selectWalletTransaction);

  const swapConfirmModal = useModal(SwapConfirm, SwapConfirmOptions);
  const selectWalletModal = useModal(SelectWalletModal, SelectWalletModalOptions);
  const transactionModal = useModal(TransactionModal, TransactionModalOptions);

  swapConfirmModal.onClose((result: boolean) => {
    if (result) {
      transactionModal.open();
    }
  });

  transactionModal.onClose(() => {
    dispatch(resetTransaction());
    if (walletTransaction.status === TxStatus.CONFIRMED) {
      dispatch(resetSwap());
    }
  });

  const isFilled = useMemo(() => {
    return TokenUtils.isFilled(input0) && TokenUtils.isFilled(input1);
  }, [input0, input1]);

  const insufficientBalance = useMemo(() => {
    if (TokenUtils.isFilled(input0)) {
      return TokenUtils.compareAmount(input0, walletBalances[input0.token.symbol]) === 1;
    }
    return false;
  }, [input0, walletBalances]);

  const hasErrors = useMemo(() => {
    return (
      !isFilled ||
      insufficientBalance ||
      (!!input0.token && !walletPermissions[input0.token.symbol]) ||
      trade.insufficientLiquidity
    );
  }, [isFilled, insufficientBalance, input0, walletPermissions, trade]);

  const swapButtonText = useMemo(() => {
    if (trade.insufficientLiquidity && input0.amount) {
      return t(`Insufficient liquidity for this trade.`);
    }
    if (!TokenUtils.isFilled(input0)) {
      return t('Enter an amount');
    }
    if (!input1.token || !input0.token) {
      return t('Select a token');
    }
    if (insufficientBalance) {
      return t(`Insufficient {{symbol0}} balance`, { symbol0: input0.token.symbol });
    }
    return t('Swap');
  }, [t, input0, input1, insufficientBalance, trade]);

  useEffect(() => {
    return () => {
      dispatch(resetSwap());
    };
  }, [dispatch]);

  useEffect(() => {
    if (token0) {
      dispatch(getSwapToken({ address: token0, position: 'input0' }));
    }
    if (token1) {
      dispatch(getSwapToken({ address: token1, position: 'input1' }));
    }
  }, [dispatch, token0, token1]);

  // Estimate EXACT_IN transaction
  useEffect((): any => {
    if (txType !== EstimateTxType.EXACT_IN) {
      return;
    }
    if (!TokenUtils.hasAmount(input0)) {
      return dispatch(
        setSwapInput1Amount({
          value: null,
          txType,
        }),
      );
    }
    if (input1.token && TokenUtils.isFilled(input0)) {
      return dispatch(
        estimateTransaction({
          input: input0,
          token: input1.token,
          txType,
        }),
      );
    }
  }, [dispatch, input0, input1.token, txType]);

  // Estimate EXACT_OUT transaction
  useEffect((): any => {
    if (txType !== EstimateTxType.EXACT_OUT) {
      return;
    }
    if (!TokenUtils.hasAmount(input1)) {
      return dispatch(
        setSwapInput0Amount({
          value: null,
          txType,
        }),
      );
    }
    if (input0.token && TokenUtils.isFilled(input1)) {
      return dispatch(
        estimateTransaction({
          input: input1,
          token: input0.token,
          txType,
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
      if (input1.token) {
        dispatch(getWalletBalance(input1.token));
      }
      if (input0.token) {
        dispatch(getWalletBalance(input0.token));
      }
      if (txType === EstimateTxType.EXACT_IN && input1.token && TokenUtils.isFilled(input0)) {
        dispatch(
          estimateTransaction({
            input: input0,
            token: input1.token,
            txType,
            source: 'auto',
          }),
        );
      }
      if (txType === EstimateTxType.EXACT_OUT && input0.token && TokenUtils.isFilled(input1)) {
        dispatch(
          estimateTransaction({
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

  const switchTokensHandler = useCallback(() => {
    dispatch(switchSwapTokens());
  }, [dispatch]);

  const selectTokenHandler = useCallback(
    (input, token) => {
      if (!token) {
        return;
      }
      if (walletAdapter) {
        dispatch(getWalletBalance(token));
        dispatch(getWalletUseTokenPermission(token));
      }
      if (input === 'input0' && TokenUtils.compareToken(input1, token)) {
        return switchTokensHandler();
      }
      if (input === 'input1' && TokenUtils.compareToken(input0, token)) {
        return switchTokensHandler();
      }
      if (input === 'input0') {
        return dispatch(setSwapInput0Token(token));
      }
      dispatch(setSwapInput1Token(token));
    },
    [dispatch, input0, input1, walletAdapter, switchTokensHandler],
  );

  const input0TokenAmountHandler = useCallback(
    (value) => {
      dispatch(
        setSwapInput0Amount({
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
        setSwapInput1Amount({
          value,
          txType: EstimateTxType.EXACT_OUT,
        }),
      );
    },
    [dispatch],
  );

  const allowUseTokenHandler = useCallback(() => {
    dispatch(setWalletUseTokenPermission(input0.token));
  }, [dispatch, input0]);

  return (
    <DexForm
      header={t('Swap')}
      className={'swap-form'}
      content={
        <>
          <TokenInput
            token={input0.token}
            balance={walletBalances[input0.token?.symbol || '']}
            value={input0.amount}
            showMax={true}
            label={t('From')}
            onSelect={selectTokenHandler.bind(null, 'input0')}
            onChange={input0TokenAmountHandler}
            selectable={true}
            editable={true}
            loading={txType === EstimateTxType.EXACT_OUT && loading}
            primary={txType === EstimateTxType.EXACT_IN}
          />
          <Button variant={'default'} size={'small'} icon={<SwapIcon />} onClick={switchTokensHandler} />
          <TokenInput
            token={input1.token}
            balance={walletBalances[input1.token?.symbol || '']}
            value={input1.amount}
            showMax={false}
            label={t('To')}
            onSelect={selectTokenHandler.bind(null, 'input1')}
            onChange={input1TokenAmountHandler}
            selectable={true}
            editable={true}
            loading={txType === EstimateTxType.EXACT_IN && loading}
            primary={txType === EstimateTxType.EXACT_OUT}
          />
          {isFilled && (
            <div className={`swap-price text-small ${loading ? 'loading' : ''}`}>
              <p>{t('Price')}</p>
              <p className="swap-price-text">
                {TokenUtils.toNumberDisplay(trade.rate)} {input0.token.symbol} per 1 {input1.token.symbol}
              </p>
              <Tooltip content={<SwapInfo />} direction="left">
                <SwapIcon />
              </Tooltip>
            </div>
          )}
        </>
      }
      actions={
        <>
          {walletConnectionStatus === WalletStatus.CONNECTED &&
            isFilled &&
            !insufficientBalance &&
            !walletPermissions[input0.token.symbol] && (
              <Button variant={'primary'} onClick={allowUseTokenHandler}>
                <Trans>Allow the TONSwap Protocol to use your {{ symbol0: input0.token.symbol }}</Trans>
              </Button>
            )}
          {walletConnectionStatus === WalletStatus.CONNECTED && (
            <Button variant={'primary'} disabled={loading || hasErrors} onClick={swapConfirmModal.open}>
              {swapButtonText}
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

export default SwapPage;
