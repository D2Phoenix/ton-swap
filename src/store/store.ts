import { configureStore } from '@reduxjs/toolkit';
import appReducer from './app/appSlice';
import swapReducer from './swap/swapSlice';
import walletReducer from './wallet/walletSlice';
import liquidityReducer from './liquidity/liquiditySlice';
import poolReducer from './pool/poolSlice';
import poolsReducer from './pools/poolsSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    swap: swapReducer,
    wallet: walletReducer,
    liquidity: liquidityReducer,
    pool: poolReducer,
    pools: poolsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
