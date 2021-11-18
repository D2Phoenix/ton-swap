import { createSlice, PayloadAction} from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import TokenInterface from 'interfaces/token.interface';

interface SwapState {
    from: TokenInterface | null,
    to: TokenInterface | null,
}

const initialState: SwapState = {
    from: {
        address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
        chainId: 1,
        decimals: 9,
        logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
        name: "Toncoin",
        symbol: "TONCOIN",
    },
    to: null,
}

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        setSwapFromToken: (state, action: PayloadAction<any>) => {
            state.from = action.payload;
        },
        setSwapToToken: (state, action: PayloadAction<any>) => {
            state.to = action.payload;
        },
    },
})

export const { setSwapFromToken, setSwapToToken } = swapSlice.actions

export const selectSwapFrom = (state: RootState) => state.swap.from;
export const selectSwapTo = (state: RootState) => state.swap.to;

export default swapSlice.reducer;
