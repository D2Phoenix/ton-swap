import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import { estimateLiquidityTransaction, fetchOneToken, fetchPoolToken, fetchTwoToken } from './liquidity.thunks';
import { shiftDecimals } from 'utils/decimals';
import { TxType } from 'interfaces/transactionInterfaces';
import { InputTokenInterface } from 'interfaces/inputTokenInterface';
import { InputPoolInterface } from '../../interfaces/inputPoolInterface';


export interface LiquidityState {
    one: InputTokenInterface,
    two: InputTokenInterface,
    txType: TxType;
    pool: InputPoolInterface;
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
        amount: null as any
    },
    two: {
        token: null as any,
        amount: null as any
    },
    txType: TxType.EXACT_IN,
    pool: {
        overallAmount: new BigNumber('0'),
        amount: new BigNumber('0'),
        burnAmount: new BigNumber('0'),
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
            state.pool.overallAmount = action.payload.poolTokens;
            state.pool.amount = action.payload.poolAmount;
        });
        builder.addCase(fetchOneToken.fulfilled, (state, action) => {
            state.one.token = action.payload;
        });
        builder.addCase(fetchTwoToken.fulfilled, (state, action) => {
            state.two.token = action.payload;
        });
        builder.addCase(fetchPoolToken.fulfilled, (state, action) => {
            state.one = action.payload.one;
            state.two = action.payload.two;
            state.pool = action.payload.pool;
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
export const selectLiquidityPool = (state: RootState) => state.liquidity.pool;

export default liquiditySlice.reducer;
