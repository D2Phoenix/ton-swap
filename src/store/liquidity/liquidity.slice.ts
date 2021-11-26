import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js';

import type { RootState } from 'store/store'
import {
    approveRemove,
    estimateLiquidityTransaction,
    getLiquidityPool, getLiquidityPoolToken,
    getLiquidityToken,
} from './liquidity.thunks';
import { shiftDecimals } from 'utils/decimals';
import { TxType, WalletTxStatus } from 'interfaces/transactionInterfaces';
import { InputTokenInterface } from 'interfaces/inputTokenInterface';
import { InputPoolInterface } from '../../interfaces/inputPoolInterface';


export interface LiquidityState {
    one: InputTokenInterface;
    two: InputTokenInterface;
    txType: TxType;
    pool: InputPoolInterface;
    oldLiquidity: {
        one: InputTokenInterface;
        two: InputTokenInterface;
        pool: InputPoolInterface;
    };
    removeApproveTx: {
        status: WalletTxStatus,
    }
}

const initialState: LiquidityState = {
    one: {
        token: {
            address: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
            chainId: 1,
            decimals: 9,
            logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
            name: 'Ton',
            symbol: 'TON',
        },
        amount: null as any
    },
    two: {
        token: null as any,
        amount: null as any
    },
    txType: TxType.EXACT_IN,
    pool: {
        token: null as any,
        overallAmount: null as any,
        amount: null as any,
        removeAmount: null as any,
    },
    oldLiquidity: {
        one: null as any,
        two: null as any,
        pool: null as any,
    },
    removeApproveTx: {
        status: WalletTxStatus.INITIAL,
    }
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
        setLiquidityPercentRemoveAmount: (state, action: PayloadAction<any>) => {
            state.one.removeAmount = state.one.amount.multipliedBy(action.payload.value).div('100');
            state.two.removeAmount = state.two.amount.multipliedBy(action.payload.value).div('100');
            state.pool.removeAmount = state.pool.amount.multipliedBy(action.payload.value).div('100');
        },
        setLiquidityOneRemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.one, [state.two, state.pool], action.payload.value);
        },
        setLiquidityTwoRemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.two, [state.one, state.pool], action.payload.value);
        },
        setLiquidityPoolRemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.pool, [state.one, state.two], action.payload.value);
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
        builder.addCase(getLiquidityToken.fulfilled, (state, action) => {
            if (action.payload.position === 'one') {
                state.one.token = action.payload.token;
                return
            }
            state.two.token = action.payload.token;
        });
        builder.addCase(getLiquidityPoolToken.fulfilled, (state, action) => {
            state.pool.token = action.payload;
        });
        builder.addCase(getLiquidityPool.fulfilled, (state, action) => {
            state.one = action.payload.one;
            state.two = action.payload.two;
            state.pool = action.payload.pool;
            state.removeApproveTx.status = WalletTxStatus.INITIAL;
        });
        builder.addCase(approveRemove.pending, (state, action) => {
            state.removeApproveTx.status = WalletTxStatus.PENDING;
        });
        builder.addCase(approveRemove.fulfilled, (state, action) => {
            state.removeApproveTx.status = action.payload;
        });
    }
});

function handleRemoveAmount(state: Draft<LiquidityState>, token: Draft<InputTokenInterface | InputPoolInterface>, deps: Draft<InputTokenInterface | InputPoolInterface>[], value: BigNumber | null) {
    if (!value) {
        token.removeAmount = null as any;
        deps.forEach((item) => {
            item.removeAmount = null as any;
        })
        return;
    }
    if (value.eq('0')) {
        token.removeAmount = value;
        deps.forEach((item) => {
            item.removeAmount = null as any;
        })
        return;
    }
    const percent = token.amount.div(value);
    token.removeAmount = value;
    if (percent.lt('1')) {
        deps.forEach((item) => {
            item.removeAmount = null as any;
        })
        return;
    }
    deps.forEach((item) => {
        item.removeAmount = item.amount.div(percent);
    });
}

export const {
    setLiquidityOneToken,
    setLiquidityTwoToken,
    switchLiquidityTokens,
    setLiquidityOneAmount,
    setLiquidityTwoAmount,
    setLiquidityOneRemoveAmount,
    setLiquidityPercentRemoveAmount,
    setLiquidityTwoRemoveAmount,
    setLiquidityPoolRemoveAmount,
    resetLiquidity,
} = liquiditySlice.actions

export const selectLiquidityOne = (state: RootState) => state.liquidity.one;
export const selectLiquidityTwo = (state: RootState) => state.liquidity.two;
export const selectLiquidityTxType = (state: RootState) => state.liquidity.txType;
export const selectLiquidityPool = (state: RootState) => state.liquidity.pool;
export const selectLiquidityRemoveApproveTx = (state: RootState) => state.liquidity.removeApproveTx;
export const selectLiquidityOldLiquidity = (state: RootState) => state.liquidity.oldLiquidity;

export default liquiditySlice.reducer;
