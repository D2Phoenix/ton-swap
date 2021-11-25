import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import SwapPage from './pages/swap/SwapPage';
import PoolPage from './pages/pool/PoolPage';
import AddLiquidityPage from './pages/liquidity/AddLiquidityPage';
import { fetchTokens } from './store/app/app.thunks';
import { useAppDispatch } from './store/hooks';

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
                      <Route path="pool" element={<PoolPage />} />
                      <Route path="pool/add" element={<AddLiquidityPage />} />
                      <Route path="pool/add/:oneToken" element={<AddLiquidityPage />} />
                      <Route path="pool/add/:oneToken/:twoToken" element={<AddLiquidityPage />} />
                      <Route path="pools" element={<SwapPage />} />
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
