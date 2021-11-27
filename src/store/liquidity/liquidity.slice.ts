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
import { InputPoolInterface } from 'interfaces/inputPoolInterface';


export interface LiquidityState {
    input0: InputTokenInterface;
    input1: InputTokenInterface;
    txType: TxType;
    pool: InputPoolInterface;
    oldLiquidity: {
        input0: InputTokenInterface;
        input1: InputTokenInterface;
        pool: InputPoolInterface;
    };
    removeApproveTx: {
        status: WalletTxStatus,
    }
}

const initialState: LiquidityState = {
    input0: {
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
    input1: {
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
        input0: null as any,
        input1: null as any,
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
        setLiquidityInput0Token: (state, action: PayloadAction<any>) => {
            const prevToken = state.input0.token;
            state.input0.token = action.payload;
            // correct amount with new token decimals
            if (state.input0.token && state.input0.amount) {
                const delta = state.input0.token.decimals - (prevToken?.decimals || 0);
                state.input0.amount = shiftDecimals(state.input0.amount as BigNumber, delta);
            }
        },
        setLiquidityInput1Token: (state, action: PayloadAction<any>) => {
            const prevToken = state.input1.token;
            state.input1.token = action.payload;
            // correct amount with new token decimals
            if (state.input1.token && state.input1.amount) {
                const delta = state.input1.token.decimals - (prevToken?.decimals || 0);
                state.input1.amount = shiftDecimals(state.input1.amount as BigNumber, delta);
            }
        },
        setLiquidityInput0Amount: (state, action: PayloadAction<any>) => {
            state.input0.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        setLiquidityInput1Amount: (state, action: PayloadAction<any>) => {
            state.input1.amount = action.payload.value;
            state.txType = action.payload.txType;
        },
        setLiquidityPercentRemoveAmount: (state, action: PayloadAction<any>) => {
            if (!state.input0.amount) {
                return;
            }
            state.input0.removeAmount = state.input0.amount.multipliedBy(action.payload.value).div('100');
            state.input1.removeAmount = state.input1.amount.multipliedBy(action.payload.value).div('100');
            state.pool.removeAmount = state.pool.amount.multipliedBy(action.payload.value).div('100');
            state.removeApproveTx.status = WalletTxStatus.INITIAL;
        },
        setLiquidityInput0RemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.input0, [state.input1, state.pool], action.payload.value);
            state.removeApproveTx.status = WalletTxStatus.INITIAL;
        },
        setLiquidityInput1RemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.input1, [state.input0, state.pool], action.payload.value);
            state.removeApproveTx.status = WalletTxStatus.INITIAL;
        },
        setLiquidityPoolRemoveAmount: (state, action: PayloadAction<any>) => {
            handleRemoveAmount(state, state.pool, [state.input0, state.input1], action.payload.value);
            state.removeApproveTx.status = WalletTxStatus.INITIAL;
        },
        switchLiquidityTokens: (state, action: PayloadAction<void>) => {
            const input1 = state.input1;
            state.input1 = state.input0;
            state.input0 = input1;
            state.txType = state.txType === TxType.EXACT_IN ? TxType.EXACT_OUT : TxType.EXACT_IN;
        },
        resetLiquidity: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(estimateLiquidityTransaction.fulfilled, (state, action) => {
            state.input0.amount = action.payload.oneAmount;
            state.input1.amount = action.payload.twoAmount;
            state.txType = action.payload.txType;
            state.pool.overallAmount = action.payload.poolTokens;
            state.pool.amount = action.payload.poolAmount;
        });
        builder.addCase(getLiquidityToken.fulfilled, (state, action) => {
            if (action.payload.position === 'one') {
                state.input0.token = action.payload.token;
                return
            }
            state.input1.token = action.payload.token;
        });
        builder.addCase(getLiquidityPoolToken.fulfilled, (state, action) => {
            state.pool.token = action.payload;
        });
        builder.addCase(getLiquidityPool.fulfilled, (state, action) => {
            state.input0 = action.payload.input0;
            state.input1 = action.payload.input1;
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
    setLiquidityInput0Token,
    setLiquidityInput1Token,
    switchLiquidityTokens,
    setLiquidityInput0Amount,
    setLiquidityInput1Amount,
    setLiquidityInput0RemoveAmount,
    setLiquidityPercentRemoveAmount,
    setLiquidityInput1RemoveAmount,
    setLiquidityPoolRemoveAmount,
    resetLiquidity,
} = liquiditySlice.actions

export const selectLiquidityInput0 = (state: RootState) => state.liquidity.input0;
export const selectLiquidityInput1 = (state: RootState) => state.liquidity.input1;
export const selectLiquidityTxType = (state: RootState) => state.liquidity.txType;
export const selectLiquidityPool = (state: RootState) => state.liquidity.pool;
export const selectLiquidityRemoveApproveTx = (state: RootState) => state.liquidity.removeApproveTx;
export const selectLiquidityOldLiquidity = (state: RootState) => state.liquidity.oldLiquidity;

export default liquiditySlice.reducer;
