import React from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.scss';
import Header from './components/Header';
import SwapPage from './pages/swap/SwapPage';
import PoolPage from './pages/pool/PoolPage';
import AddLiquidityPage from './pages/liquidity/AddLiquidityPage';

function App() {
  return (
      <>
          <Header />
          <main>
              <div className="container">
                  <Routes>
                      <Route path="swap" element={<SwapPage />} />
                      <Route path="pool" element={<PoolPage />} />
                      <Route path="pool/add" element={<AddLiquidityPage />} />
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
