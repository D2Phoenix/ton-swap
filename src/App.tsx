import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import SwapPage from './pages/swap/SwapPage';
import PoolPage from './pages/pool/PoolPage';
import AddLiquidityPage from './pages/liquidity/AddLiquidityPage';
import { fetchTokens } from './store/app/app.thunks';
import { useAppDispatch } from './store/hooks';
import RemoveLiquidityPage from './pages/liquidity/RemoveLiquidityPage';
import PoolsPage from './pages/pools/PoolsPage';
import PoolDetails from './pages/pools/PoolDetails';

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
                      <Route path="swap" element={<SwapPage />} />
                      <Route path="swap/:token0" element={<SwapPage />} />
                      <Route path="swap/:token0/:token1" element={<SwapPage />} />
                      <Route path="pool" element={<PoolPage />} />
                      <Route path="pool/add" element={<AddLiquidityPage />} />
                      <Route path="pool/add/:token0" element={<AddLiquidityPage />} />
                      <Route path="pool/add/:token0/:token1" element={<AddLiquidityPage />} />
                      <Route path="pool/remove/:token0/:token1" element={<RemoveLiquidityPage />} />
                      <Route path="pools" element={<PoolsPage />} />
                      <Route path="pools/:address" element={<PoolDetails />} />
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
