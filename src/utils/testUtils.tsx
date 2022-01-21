import { configureStore } from '@reduxjs/toolkit';
import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

// Import your own reducer
import appReducer from 'store/app/appSlice';
import liquidityReducer from 'store/liquidity/liquiditySlice';
import poolReducer from 'store/pool/poolSlice';
import poolsReducer from 'store/pools/poolsSlice';
import swapReducer from 'store/swap/swapSlice';
import walletReducer from 'store/wallet/walletSlice';

function render(
  ui: JSX.Element,
  {
    preloadedState,
    store = configureStore({
      reducer: {
        app: appReducer,
        swap: swapReducer,
        wallet: walletReducer,
        liquidity: liquidityReducer,
        pool: poolReducer,
        pools: poolsReducer,
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  }: any = {},
) {
  function Wrapper({ children }: { children: JSX.Element }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };

export function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
