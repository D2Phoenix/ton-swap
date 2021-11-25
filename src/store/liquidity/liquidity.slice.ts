import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import { estimateLiquidityTransaction } from './liquidity.thunks';
import { shiftDecimals } from 'utils/decimals';
import { TxType } from 'interfaces/transactionInterfaces';
import { InputTokenInterface } from 'interfaces/inputTokenInterface';


export interface LiquidityState {
    one: InputTokenInterface,
    two: InputTokenInterface,
    txType: TxType;
    details: {
        poolTokens: BigNumber;
        poolAmount: BigNumber;
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
    txType: TxType.EXACT_IN,
    details: {
        poolTokens: new BigNumber('0'),
        poolAmount: new BigNumber('0'),
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
            state.txType = state.txType === TxType.EXACT_IN ? TxType.EXACT_OUT : TxType.EXACT_IN;
        },
        resetLiquidity: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateLiquidityTransaction.fulfilled, (state, action) => {
            state.two.amount = action.payload.twoAmount;
            state.one.amount = action.payload.oneAmount;
            state.txType = action.payload.txType;
            state.details.poolTokens = action.payload.poolTokens;
            state.details.poolAmount = action.payload.poolAmount;
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
