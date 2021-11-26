import { configureStore } from '@reduxjs/toolkit'
import appReducer from './app/app.slice';
import swapReducer from './swap/swap.slice';
import walletReducer from './wallet/wallet.slice';
import liquidityReducer from './liquidity/liquidity.slice';
import poolReducer from './pool/pool.slice';
import poolsReducer from './pools/pools.slice';

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
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
