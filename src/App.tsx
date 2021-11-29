import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import SwapPage from './pages/Swap/SwapPage';
import PoolPage from './pages/Pool/PoolPage';
import AddLiquidityPage from './pages/AddLiquidity/AddLiquidityPage';
import { fetchTokens } from './store/app/appThunks';
import { useAppDispatch } from './store/hooks';
import RemoveLiquidityPage from './pages/RemoveLiquidity/RemoveLiquidityPage';
import PoolsPage from './pages/Pools/PoolsPage';
import PoolDetailsPage from './pages/PoolDetails/PoolDetailsPage';
import ImportPoolPage from './pages/ImportPool/ImportPoolPage';

function App() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchTokens());
    }, [dispatch]);

    return (
      <>
          <Header />
          <main>
              <div className="container">
                  <Routes>
                      <Route
                          path="/"
                          element={<Navigate replace to="/swap" />}
                      />
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
                  </Routes>
              </div>
          </main>
          <footer>
              <div className="container"/>
          </footer>
      </>
    );
}

export default App;
