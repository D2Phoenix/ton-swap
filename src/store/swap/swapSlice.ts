import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { InputTokenInterface } from 'types/inputTokenInterface';
import { EstimateTxType } from 'types/transactionInterfaces';

import type { RootState } from 'store/store';

import { estimateTransaction, getSwapToken } from './swapThunks';

export interface SwapState {
  input0: InputTokenInterface;
  input1: InputTokenInterface;
  txType: EstimateTxType;
  loading: boolean;
  trade: {
    fee: string;
    priceImpact: string;
    liquidityProviderFee: string;
    insufficientLiquidity: boolean;
    maximumSent: string | null;
    minimumReceived: string | null;
    rate: string;
  };
}

export const initialState: SwapState = {
  input0: {
    token: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      chainId: 1,
      decimals: 9,
      logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
      name: 'Ton',
      symbol: 'TON',
    },
    amount: '',
  },
  input1: {
    token: null as any,
    amount: '',
  },
  txType: EstimateTxType.EXACT_IN,
  loading: false,
  trade: {
    fee: '0',
    priceImpact: '0',
    liquidityProviderFee: '0',
    insufficientLiquidity: false,
    maximumSent: null,
    minimumReceived: null,
    rate: '0',
  },
};

export const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setSwapInput0Token: (state, action: PayloadAction<any>) => {
      state.input0.token = action.payload;
    },
    setSwapInput1Token: (state, action: PayloadAction<any>) => {
      state.input1.token = action.payload;
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
    builder.addCase(estimateTransaction.pending, (state, action) => {
      if (action.meta.arg.source !== 'auto') {
        state.loading = true;
      }
    });
    builder.addCase(estimateTransaction.fulfilled, (state, action) => {
      state.input0.amount = action.payload.fromAmount;
      state.input1.amount = action.payload.toAmount;
      state.txType = action.payload.type;
      state.trade = action.payload.trade;
      state.loading = false;
    });
    builder.addCase(getSwapToken.fulfilled, (state, action) => {
      if (action.payload.position === 'input0') {
        state.input0.token = action.payload.token;
        return;
      }
      state.input1.token = action.payload.token;
    });
  },
});

export const {
  setSwapInput0Token,
  setSwapInput1Token,
  switchSwapTokens,
  setSwapInput0Amount,
  setSwapInput1Amount,
  resetSwap,
} = swapSlice.actions;

export const selectSwapInput0 = (state: RootState) => state.swap.input0;
export const selectSwapInput1 = (state: RootState) => state.swap.input1;
export const selectSwapTxType = (state: RootState) => state.swap.txType;
export const selectSwapTrade = (state: RootState) => state.swap.trade;
export const selectSwapLoading = (state: RootState) => state.swap.loading;

export default swapSlice.reducer;
