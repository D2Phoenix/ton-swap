import { configureStore } from '@reduxjs/toolkit'
import appReducer from './app/app.slice';
import swapReducer from './swap/swap.slice';
import walletReducer from './wallet/wallet.slice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        swap: swapReducer,
        wallet: walletReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['wallet/connect/fulfilled'],
                ignoredPaths: ['wallet.adapter'],
            },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
