import React from 'react';

import './App.scss';
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import SwapPage from './pages/swap/SwapPage';

function App() {
  return (
      <>
          <Header />
          <main>
              <div className="container">
                  <Routes>
                      <Route path="swap" element={<SwapPage />} />
                      <Route path="pool" element={<SwapPage />} />
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
