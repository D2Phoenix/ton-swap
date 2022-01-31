import React, { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import Notifications, { Notification } from './components/Notifications';
import { WALLET_TX_UPDATE_INTERVAL } from './constants/swap';
import AddLiquidityPage from './pages/AddLiquidity/AddLiquidityPage';
import ImportPoolPage from './pages/ImportPool/ImportPoolPage';
import PoolPage from './pages/Pool/PoolPage';
import PoolDetailsPage from './pages/PoolDetails/PoolDetailsPage';
import PoolsPage from './pages/Pools/PoolsPage';
import RemoveLiquidityPage from './pages/RemoveLiquidity/RemoveLiquidityPage';
import SwapPage from './pages/Swap/SwapPage';
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

  const notificationCloseHandler = useCallback(
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
        </div>
        <Notifications>
          {notNotifiedTransactions.map((tx) => {
            return (
              <Notification
                key={tx.id}
                type={tx.status === TxStatus.SUCCEED ? 'success' : 'error'}
                onClose={notificationCloseHandler.bind(null, tx)}
              >
                {tx.type === TxType.SWAP && (
                  <p className="title-2">
                    <Trans>
                      Swap {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} for {{ amount1: tx.amount1 }}{' '}
                      {{ symbol1: tx.token1.symbol }}
                    </Trans>
                  </p>
                )}
                {tx.type === TxType.MINT && (
                  <p className="title-2">
                    <Trans>
                      Add {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} and {{ amount1: tx.amount1 }}{' '}
                      {{ symbol1: tx.token1.symbol }}
                    </Trans>
                  </p>
                )}
                {tx.type === TxType.BURN && (
                  <p className="title-2">
                    <Trans>
                      Remove {{ amount0: tx.amount0 }} {{ symbol0: tx.token0.symbol }} and {{ amount1: tx.amount1 }}{' '}
                      {{ symbol1: tx.token1.symbol }}
                    </Trans>
                  </p>
                )}
                <br />
                <p>{t('View on Explorer')}</p>
              </Notification>
            );
          })}
        </Notifications>
      </main>
    </>
  );
}

export default App;
