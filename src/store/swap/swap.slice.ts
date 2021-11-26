import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import { estimateTransaction } from './swap.thunks';
import { shiftDecimals } from 'utils/decimals';
import { TxType } from 'interfaces/transactionInterfaces';
import { InputTokenInterface } from 'interfaces/inputTokenInterface';


export interface SwapState {
    from: InputTokenInterface,
    to: InputTokenInterface,
    txType: TxType;
    details: {
        fee: BigNumber;
        priceImpact: BigNumber;
        insufficientLiquidity: boolean;
    };
}

const initialState: SwapState = {
    from: {
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
    to: {
        token: null as any,
        amount: null as any,
    },
    txType: TxType.EXACT_IN,
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
        setSwapFromToken: (state, action: PayloadAction<any>) => {
            const prevToken = state.from.token;
            state.from.token = action.payload;
            // correct amount with new token decimals
            if (state.from.token && state.from.amount) {
                const delta = state.from.token.decimals - (prevToken?.decimals || 0);
                state.from.amount = shiftDecimals(state.from.amount as BigNumber, delta);
            }
        },
        setSwapToToken: (state, action: PayloadAction<any>) => {
            const prevToken = state.to.token;
            state.to.token = action.payload;
            // correct amount with new token decimals
            if (state.to.token && state.to.amount) {
                const delta = state.to.token.decimals - (prevToken?.decimals || 0);
                state.to.amount = shiftDecimals(state.to.amount as BigNumber, delta);
            }
        },
        setSwapFromAmount: (state, action: PayloadAction<any>) => {
            state.from.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        setSwapToAmount: (state, action: PayloadAction<any>) => {
            state.to.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        switchSwapTokens: (state, action: PayloadAction<void>) => {
            const from = state.to;
            state.to = state.from;
            state.from = from;
            state.txType = state.txType === TxType.EXACT_IN ? TxType.EXACT_OUT : TxType.EXACT_IN;
        },
        resetSwap: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateTransaction.fulfilled, (state, action) => {
            state.to.amount = action.payload.toAmount;
            state.from.amount = action.payload.fromAmount;
            state.txType = action.payload.type;
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
    setSwapFromAmount,
    setSwapToAmount,
    resetSwap,
} = swapSlice.actions

export const selectSwapFrom = (state: RootState) => state.swap.from;
export const selectSwapTo = (state: RootState) => state.swap.to;
export const selectSwapTxType = (state: RootState) => state.swap.txType;
export const selectSwapDetails = (state: RootState) => state.swap.details;

export default swapSlice.reducer;
