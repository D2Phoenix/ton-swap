import { createSlice, PayloadAction} from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import TokenInterface from 'interfaces/token.interface';

interface SwapState {
    from: TokenInterface | null,
    to: TokenInterface | null,
    fromAmount: string;
    toAmount: string;
}

const initialState: SwapState = {
    from: {
        address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
        chainId: 1,
        decimals: 9,
        logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
        name: "Ton",
        symbol: "TON",
    },
    to: null,
    fromAmount: '',
    toAmount: '',
}

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        setSwapFromToken: (state, action: PayloadAction<any>) => {
            const from = state.from;
            state.from = action.payload;
            if (state.to && state.from && state.from.symbol === state.to.symbol) {
                state.to = from;
            }
        },
        setSwapToToken: (state, action: PayloadAction<any>) => {
            const to = state.to;
            state.to = action.payload;
            if (state.to && state.from && state.from.symbol === state.to.symbol) {
                state.from = to;
            }
        },
        setSwapFromTokenAmount: (state, action: PayloadAction<any>) => {
            state.fromAmount = action.payload;
        },
        setSwapToTokenAmount: (state, action: PayloadAction<any>) => {
            state.toAmount = action.payload;
        },
        switchSwapTokens: (state, action: PayloadAction<void>) => {
            const from = state.to;
            const fromAmount = state.toAmount;
            state.to = state.from;
            state.from = from;
            state.toAmount = state.fromAmount;
            state.fromAmount = fromAmount
        },
    },
})

export const {
    setSwapFromToken,
    setSwapToToken,
    switchSwapTokens,
    setSwapFromTokenAmount,
    setSwapToTokenAmount
} = swapSlice.actions

export const selectSwapFrom = (state: RootState) => state.swap.from;
export const selectSwapTo = (state: RootState) => state.swap.to;
export const selectSwapFromAmount = (state: RootState) => state.swap.fromAmount;
export const selectSwapToAmount = (state: RootState) => state.swap.toAmount;

export default swapSlice.reducer;
