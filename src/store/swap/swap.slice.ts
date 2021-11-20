import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import TokenInterface from 'interfaces/token.interface';
import { estimateTransaction } from './swap.thunks';
import { SwapType } from '../../interfaces/swap.type';
import { shiftDecimals } from '../../utils/decimals';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from '../../constants/swap';

interface SwapState {
    from: TokenInterface | null,
    to: TokenInterface | null,
    fromAmount: BigNumber | null;
    toAmount: BigNumber | null;
    lastSwapType: SwapType;
    settings: {
        slippage: string,
        deadline: string,
    }
    details: {
        fee: BigNumber;
        priceImpact: BigNumber;
        insufficientLiquidity: boolean;
    }
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
    fromAmount: null,
    toAmount: null,
    lastSwapType: SwapType.EXACT_IN,
    settings: {
        slippage: DEFAULT_SLIPPAGE,
        deadline: DEFAULT_DEADLINE,
    },
    details: {
        fee: new BigNumber('0'),
        priceImpact: new BigNumber('0'),
        insufficientLiquidity: false,
    }
}

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        setSwapFromToken: (state, action: PayloadAction<any>) => {
            const oldFrom = state.from;
            state.from = action.payload;
            // correct amount with new token decimals
            if (state.from && state.fromAmount) {
                state.fromAmount = shiftDecimals(state.fromAmount as BigNumber, state.from.decimals - (oldFrom ? oldFrom.decimals : 0));
            }
        },
        setSwapToToken: (state, action: PayloadAction<any>) => {
            const oldTo = state.to;
            state.to = action.payload;
            // correct amount with new token decimals
            if (state.to && state.toAmount) {
                state.toAmount = shiftDecimals(state.toAmount as BigNumber, state.to.decimals - (oldTo ? oldTo.decimals : 0));
            }
        },
        setSwapFromTokenAmount: (state, action: PayloadAction<any>) => {
            state.fromAmount = action.payload.value;
            state.lastSwapType = action.payload.swapType;
        },
        setSwapToTokenAmount: (state, action: PayloadAction<any>) => {
            state.toAmount = action.payload.value;
            state.lastSwapType = action.payload.swapType;
        },
        switchSwapTokens: (state, action: PayloadAction<void>) => {
            const from = state.to;
            const fromAmount = state.toAmount;
            state.to = state.from;
            state.from = from;
            state.toAmount = state.fromAmount;
            state.fromAmount = fromAmount;
            state.lastSwapType = state.lastSwapType === SwapType.EXACT_IN ? SwapType.EXACT_OUT : SwapType.EXACT_IN;
        },
        setSwapSlippage: (state, action: PayloadAction<any>) => {
            state.settings.slippage = action.payload;
        },
        setSwapDeadline: (state, action: PayloadAction<any>) => {
            state.settings.deadline = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateTransaction.fulfilled, (state, action) => {
            state.toAmount = action.payload.toAmount;
            state.fromAmount = action.payload.fromAmount;
            state.lastSwapType = action.payload.type;
            state.details.fee = action.payload.fee;
            state.details.priceImpact = action.payload.priceImpact;
            state.details.insufficientLiquidity = action.payload.insufficientLiquidity;
        })
    }
})

export const {
    setSwapFromToken,
    setSwapToToken,
    switchSwapTokens,
    setSwapFromTokenAmount,
    setSwapToTokenAmount,
    setSwapSlippage,
    setSwapDeadline
} = swapSlice.actions

export const selectSwapFrom = (state: RootState) => state.swap.from;
export const selectSwapTo = (state: RootState) => state.swap.to;
export const selectSwapFromAmount = (state: RootState) => state.swap.fromAmount;
export const selectSwapToAmount = (state: RootState) => state.swap.toAmount;
export const selectSwapLastSwapType = (state: RootState) => state.swap.lastSwapType;
export const selectSwapSettings = (state: RootState) => state.swap.settings;
export const selectSwapDetails = (state: RootState) => state.swap.details;

export default swapSlice.reducer;
