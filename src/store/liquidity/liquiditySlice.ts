import { Draft, PayloadAction, createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import { InputPoolInterface } from 'types/inputPoolInterface';
import { InputTokenInterface } from 'types/inputTokenInterface';
import { EstimateTxType, TxStatus } from 'types/transactionInterfaces';

import type { RootState } from 'store/store';

import {
  approveRemove,
  estimateLiquidityTransaction,
  getLiquidityPool,
  getLiquidityPoolToken,
  getLiquidityToken,
} from './liquidityThunks';

export interface LiquidityState {
  input0: InputTokenInterface;
  input1: InputTokenInterface;
  txType: EstimateTxType;
  pool: InputPoolInterface;
  loading: boolean;
  info: {
    token0PerToken1: string;
    token1PerToken0: string;
    share: string;
  };
  oldLiquidity: {
    input0: InputTokenInterface;
    input1: InputTokenInterface;
    pool: InputPoolInterface;
  };
  removeApproveTx: {
    status: TxStatus;
  };
}

const initialState: LiquidityState = {
  input0: {
    token: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      chainId: 1,
      decimals: 9,
      logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
      name: 'Ton',
      symbol: 'TON',
    },
    amount: null as any,
  },
  input1: {
    token: null as any,
    amount: null as any,
  },
  txType: EstimateTxType.EXACT_IN,
  pool: {
    token: null as any,
    overallAmount: null as any,
    amount: null as any,
    removeAmount: null as any,
  },
  info: {
    token0PerToken1: '',
    token1PerToken0: '',
    share: '',
  },
  loading: false,
  oldLiquidity: {
    input0: null as any,
    input1: null as any,
    pool: null as any,
  },
  removeApproveTx: {
    status: TxStatus.INITIAL,
  },
};

export const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setLiquidityInput0Token: (state, action: PayloadAction<any>) => {
      state.input0.token = action.payload;
    },
    setLiquidityInput1Token: (state, action: PayloadAction<any>) => {
      state.input1.token = action.payload;
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
      state.input0.removeAmount = new BigNumber(state.input0.amount)
        .multipliedBy(action.payload.value)
        .div('100')
        .toString();
      state.input1.removeAmount = new BigNumber(state.input1.amount)
        .multipliedBy(action.payload.value)
        .div('100')
        .toString();
      state.pool.removeAmount = new BigNumber(state.pool.amount)
        .multipliedBy(action.payload.value)
        .div('100')
        .toString();
      state.removeApproveTx.status = TxStatus.INITIAL;
    },
    setLiquidityInput0RemoveAmount: (state, action: PayloadAction<any>) => {
      handleRemoveAmount(state, state.input0, [state.input1, state.pool], action.payload.value);
      state.removeApproveTx.status = TxStatus.INITIAL;
    },
    setLiquidityInput1RemoveAmount: (state, action: PayloadAction<any>) => {
      handleRemoveAmount(state, state.input1, [state.input0, state.pool], action.payload.value);
      state.removeApproveTx.status = TxStatus.INITIAL;
    },
    setLiquidityPoolRemoveAmount: (state, action: PayloadAction<any>) => {
      handleRemoveAmount(state, state.pool, [state.input0, state.input1], action.payload.value);
      state.removeApproveTx.status = TxStatus.INITIAL;
    },
    switchLiquidityTokens: (state, action: PayloadAction<void>) => {
      const input1 = state.input1;
      state.input1 = state.input0;
      state.input0 = input1;
      state.txType = state.txType === EstimateTxType.EXACT_IN ? EstimateTxType.EXACT_OUT : EstimateTxType.EXACT_IN;
    },
    resetLiquidity: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(estimateLiquidityTransaction.pending, (state, action) => {
      if (action.meta.arg.source !== 'auto') {
        state.loading = true;
      }
    });
    builder.addCase(estimateLiquidityTransaction.fulfilled, (state, action) => {
      if (state.input0.token && state.input1.token) {
        state.input0.amount = action.payload.oneAmount;
        state.input1.amount = action.payload.twoAmount;
        state.txType = action.payload.txType;
        state.pool.overallAmount = action.payload.poolOverallAmount;
        state.pool.amount = action.payload.poolAmount;
        state.info = action.payload.info;
      }
      state.loading = false;
    });
    builder.addCase(getLiquidityToken.fulfilled, (state, action) => {
      if (action.payload.position === 'input0') {
        state.input0.token = action.payload.token;
        return;
      }
      state.input1.token = action.payload.token;
    });
    builder.addCase(getLiquidityPoolToken.fulfilled, (state, action) => {
      state.pool.token = action.payload;
    });
    builder.addCase(getLiquidityPool.fulfilled, (state, action) => {
      state.input0 = action.payload.pool.input0;
      state.input1 = action.payload.pool.input1;
      state.pool = action.payload.pool.pool;
      state.info = action.payload.info;
      state.removeApproveTx.status = TxStatus.INITIAL;
    });
    builder.addCase(approveRemove.pending, (state, action) => {
      state.removeApproveTx.status = TxStatus.PENDING;
    });
    builder.addCase(approveRemove.fulfilled, (state, action) => {
      state.removeApproveTx.status = action.payload;
    });
  },
});

function handleRemoveAmount(
  state: Draft<LiquidityState>,
  token: Draft<InputTokenInterface | InputPoolInterface>,
  deps: Draft<InputTokenInterface | InputPoolInterface>[],
  value: string | null,
) {
  if (!value) {
    token.removeAmount = null as any;
    deps.forEach((item) => {
      item.removeAmount = null as any;
    });
    return;
  }
  if (new BigNumber(value).eq('0')) {
    token.removeAmount = value;
    deps.forEach((item) => {
      item.removeAmount = null as any;
    });
    return;
  }
  const percentBig = new BigNumber(token.amount).div(value);
  token.removeAmount = value;
  if (percentBig.lt('1')) {
    deps.forEach((item) => {
      item.removeAmount = null as any;
    });
    return;
  }
  deps.forEach((item) => {
    const result = new BigNumber(item.amount).div(percentBig);
    item.removeAmount = result.isNaN() ? (null as any) : result.toString();
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
} = liquiditySlice.actions;

export const selectLiquidityInput0 = (state: RootState) => state.liquidity.input0;
export const selectLiquidityInput1 = (state: RootState) => state.liquidity.input1;
export const selectLiquidityTxType = (state: RootState) => state.liquidity.txType;
export const selectLiquidityPool = (state: RootState) => state.liquidity.pool;
export const selectLiquidityRemoveApproveTx = (state: RootState) => state.liquidity.removeApproveTx;
export const selectLiquidityOldLiquidity = (state: RootState) => state.liquidity.oldLiquidity;
export const selectLiquidityLoading = (state: RootState) => state.liquidity.loading;
export const selectLiquidityInfo = (state: RootState) => state.liquidity.info;

export default liquiditySlice.reducer;
