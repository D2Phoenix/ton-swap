import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import { estimateTransaction } from './swap.thunks';
import { shiftDecimals } from 'utils/decimals';
import { EstimateTxType } from 'types/transactionInterfaces';
import { InputTokenInterface } from 'types/inputTokenInterface';


export interface SwapState {
    input0: InputTokenInterface,
    input1: InputTokenInterface,
    txType: EstimateTxType;
    details: {
        fee: BigNumber;
        priceImpact: BigNumber;
        insufficientLiquidity: boolean;
    };
}

const initialState: SwapState = {
    input0: {
        token: {
            address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
            chainId: 1,
            decimals: 9,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
            name: "Ton",
            symbol: "TON",
        },
        amount: null as any,
    },
    input1: {
        token: null as any,
        amount: null as any,
    },
    txType: EstimateTxType.EXACT_IN,
    details: {
        fee: new BigNumber('0'),
        priceImpact: new BigNumber('0'),
        insufficientLiquidity: false,
    },
}

export const swapSlice = createSlice({
    name: 'swap',
    initialState,
    reducers: {
        setSwapInput0Token: (state, action: PayloadAction<any>) => {
            const prevToken = state.input0.token;
            state.input0.token = action.payload;
            // correct amount with new token decimals
            if (state.input0.token && state.input0.amount) {
                const delta = state.input0.token.decimals - (prevToken?.decimals || 0);
                state.input0.amount = shiftDecimals(state.input0.amount as BigNumber, delta);
            }
        },
        setSwapInput1Token: (state, action: PayloadAction<any>) => {
            const prevInput = state.input1.token;
            state.input1.token = action.payload;
            // correct amount with new token decimals
            if (state.input1.token && state.input1.amount) {
                const delta = state.input1.token.decimals - (prevInput?.decimals || 0);
                state.input1.amount = shiftDecimals(state.input1.amount as BigNumber, delta);
            }
        },
        setSwapInput0Amount: (state, action: PayloadAction<any>) => {
            state.input0.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        setSwapInput1Amount: (state, action: PayloadAction<any>) => {
            state.input1.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        switchSwapTokens: (state, action: PayloadAction<void>) => {
            const from = state.input1;
            state.input1 = state.input0;
            state.input0 = from;
            state.txType = state.txType === EstimateTxType.EXACT_IN ? EstimateTxType.EXACT_OUT : EstimateTxType.EXACT_IN;
        },
        resetSwap: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateTransaction.fulfilled, (state, action) => {
            state.input0.amount = action.payload.fromAmount;
            state.input1.amount = action.payload.toAmount;
            state.txType = action.payload.type;
            state.details.fee = action.payload.fee;
            state.details.priceImpact = action.payload.priceImpact;
            state.details.insufficientLiquidity = action.payload.insufficientLiquidity;
        })
    }
})

export const {
    setSwapInput0Token,
    setSwapInput1Token,
    switchSwapTokens,
    setSwapInput0Amount,
    setSwapInput1Amount,
    resetSwap,
} = swapSlice.actions

export const selectSwapInput0 = (state: RootState) => state.swap.input0;
export const selectSwapInput1 = (state: RootState) => state.swap.input1;
export const selectSwapTxType = (state: RootState) => state.swap.txType;
export const selectSwapDetails = (state: RootState) => state.swap.details;

export default swapSlice.reducer;
