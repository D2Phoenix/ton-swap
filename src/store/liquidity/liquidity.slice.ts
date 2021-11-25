import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import { estimateLiquidityTransaction } from './liquidity.thunks';
import { shiftDecimals } from 'utils/decimals';
import { TransactionType } from 'interfaces/transactionInterfaces';
import { InputTokenInterface } from 'interfaces/inputTokenInterface';


export interface LiquidityState {
    one: InputTokenInterface,
    two: InputTokenInterface,
    txType: TransactionType;
    details: {
        fee: BigNumber;
        priceImpact: BigNumber;
        insufficientLiquidity: boolean;
    };
}

const initialState: LiquidityState = {
    one: {
        token: {
            address: "0x582d872a1b094fc48f5de31d3b73f2d9be47def1",
            chainId: 1,
            decimals: 9,
            logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png",
            name: "Ton",
            symbol: "TON",
        },
    },
    two: {},
    txType: TransactionType.EXACT_IN,
    details: {
        fee: new BigNumber('0'),
        priceImpact: new BigNumber('0'),
        insufficientLiquidity: false,
    },
}

export const liquiditySlice = createSlice({
    name: 'liquidity',
    initialState,
    reducers: {
        setLiquidityOneToken: (state, action: PayloadAction<any>) => {
            const prevToken = state.one.token;
            state.one.token = action.payload;
            // correct amount with new token decimals
            if (state.one.token && state.one.amount) {
                const delta = state.one.token.decimals - (prevToken?.decimals || 0);
                state.one.amount = shiftDecimals(state.one.amount as BigNumber, delta);
            }
        },
        setLiquidityTwoToken: (state, action: PayloadAction<any>) => {
            const prevToken = state.two.token;
            state.two.token = action.payload;
            // correct amount with new token decimals
            if (state.two.token && state.two.amount) {
                const delta = state.two.token.decimals - (prevToken?.decimals || 0);
                state.two.amount = shiftDecimals(state.two.amount as BigNumber, delta);
            }
        },
        setLiquidityOneAmount: (state, action: PayloadAction<any>) => {
            state.one.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        setLiquidityTwoAmount: (state, action: PayloadAction<any>) => {
            state.two.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        switchLiquidityTokens: (state, action: PayloadAction<void>) => {
            const two = state.two;
            state.two = state.one;
            state.one = two;
            state.txType = state.txType === TransactionType.EXACT_IN ? TransactionType.EXACT_OUT : TransactionType.EXACT_IN;
        },
        resetLiquidity: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateLiquidityTransaction.fulfilled, (state, action) => {
            state.two.amount = action.payload.toAmount;
            state.one.amount = action.payload.fromAmount;
            state.txType = action.payload.txType;
            state.details.fee = action.payload.fee;
            state.details.priceImpact = action.payload.priceImpact;
            state.details.insufficientLiquidity = action.payload.insufficientLiquidity;
        })
    }
})

export const {
    setLiquidityOneToken,
    setLiquidityTwoToken,
    switchLiquidityTokens,
    setLiquidityOneAmount,
    setLiquidityTwoAmount,
    resetLiquidity,
} = liquiditySlice.actions

export const selectLiquidityOne = (state: RootState) => state.liquidity.one;
export const selectLiquidityTwo = (state: RootState) => state.liquidity.two;
export const selectLiquidityTxType = (state: RootState) => state.liquidity.txType;
export const selectLiquidityDetails = (state: RootState) => state.liquidity.details;

export default liquiditySlice.reducer;
