import React, { Suspense, lazy, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import Notifications, { Notification } from './components/Notifications';
import Spinner from './components/Spinner';
import { WALLET_TX_UPDATE_INTERVAL } from './constants/swap';
import { fetchTokens } from './store/app/appThunks';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  selectWalletAdapter,
  selectWalletConfirmedTransactions,
  selectWalletNotNotifiedTransactions,
  setNotified,
} from './store/wallet/walletSlice';
import { walletCheckTransactions } from './store/wallet/walletThunks';
import { TxStatus, TxType } from './types/transactionInterfaces';

const SwapPage = lazy(() => import('./pages/Swap/SwapPage'));
const PoolPage = lazy(() => import('./pages/Pool/PoolPage'));
const AddLiquidityPage = lazy(() => import('./pages/AddLiquidity/AddLiquidityPage'));
const RemoveLiquidityPage = lazy(() => import('./pages/RemoveLiquidity/RemoveLiquidityPage'));
const PoolsPage = lazy(() => import('./pages/Pools/PoolsPage'));
const PoolDetailsPage = lazy(() => import('./pages/PoolDetails/PoolDetailsPage'));
const ImportPoolPage = lazy(() => import('./pages/ImportPool/ImportPoolPage'));

function App() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const walletAdapter = useAppSelector(selectWalletAdapter);
  const confirmedTransactions = useAppSelector(selectWalletConfirmedTransactions);
  const notNotifiedTransactions = useAppSelector(selectWalletNotNotifiedTransactions);

  useEffect(() => {
    dispatch(fetchTokens());
  }, [dispatch]);

  // Update CONFIRMED transaction every {WALLET_TX_UPDATE_INTERVAL} milliseconds
  useEffect((): any => {
    if (!walletAdapter) {
      return;
    }
    const intervalId = setInterval(() => {
      dispatch(walletCheckTransactions(confirmedTransactions));
    }, WALLET_TX_UPDATE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [dispatch, walletAdapter, confirmedTransactions]);

  const handleNotificationClose = useCallback(
    (tx) => {
      dispatch(setNotified(tx));
    },
    [dispatch],
  );

  return (
    <>
      <Header />
      <main>
        <div className="container">
          <Suspense
            fallback={
              <div className="lazy-loader">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route path="swap" element={<SwapPage />} />
              <Route path="swap/:token0" element={<SwapPage />} />
              <Route path="swap/:token0/:token1" element={<SwapPage />} />
              <Route path="pool" element={<PoolPage />} />
              <Route path="pool/add" element={<AddLiquidityPage />} />
              <Route path="pool/add/:token0" element={<AddLiquidityPage />} />
              <Route path="pool/add/:token0/:token1" element={<AddLiquidityPage />} />
              <Route path="pool/remove/:token0/:token1" element={<RemoveLiquidityPage />} />
              <Route path="pool/import" element={<ImportPoolPage />} />
              <Route path="pools" element={<PoolsPage />} />
              <Route path="pools/:address" element={<PoolDetailsPage />} />
              <Route path="*" element={<Navigate replace to="/swap" />} />
            </Routes>
          </Suspense>
        </div>
        <Notifications>
          {notNotifiedTransactions.map((tx) => {
            return (
              <Notification
                key={tx.id}
                type={tx.status === TxStatus.SUCCEED ? 'success' : 'error'}
                onClose={handleNotificationClose.bind(null, tx)}
              >
                {tx.type === TxType.SWAP && (
                  <Trans>
                    Swap {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} for {{ amount1: tx.amount1 }}{' '}
                    {{ symbol1: tx.token1.symbol }}
                  </Trans>
                )}
                {tx.type === TxType.MINT && (
                  <Trans>
                    Add {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} and {{ amount1: tx.amount1 }}{' '}
                    {{ symbol1: tx.token1.symbol }}
                  </Trans>
                )}
                {tx.type === TxType.BURN && (
                  <Trans>
                    Remove {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} and {{ amount1: tx.amount1 }}{' '}
                    {{ symbol1: tx.token1.symbol }}
                  </Trans>
                )}
                <br />
                <a>{t('View on Explorer')}</a>
              </Notification>
            );
          })}
        </Notifications>
      </main>
    </>
  );
}

export default App;
