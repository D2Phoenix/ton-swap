import { configureStore } from '@reduxjs/toolkit'
import appReducer from './app/appSlice';
import swapReducer from './swap/swapSlice';

export const store = configureStore({
    reducer: {
        app: appReducer,
        swap: swapReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
