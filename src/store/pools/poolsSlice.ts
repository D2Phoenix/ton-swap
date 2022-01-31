import { createSlice } from '@reduxjs/toolkit';

import PoolItemInterface from 'types/poolItemInterface';

import type { RootState } from 'store/store';

import { fetchPool, fetchPools } from './poolsThunks';

interface PoolState {
  list: PoolItemInterface[];
  pool: PoolItemInterface;
  chartData: any[];
  transactions: any[];
}

const initialState: PoolState = {
  list: [],
  pool: null as any,
  chartData: [],
  transactions: [],
};

export const poolsSlice = createSlice({
  name: 'pools',
  initialState,
  reducers: {
    resetPoolDetails: (state) => {
      state.pool = null as any;
      state.chartData = [];
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPools.fulfilled, (state, action) => {
      state.list = action.payload;
    });
    builder.addCase(fetchPool.pending, (state, action) => {
      state.pool = state.list.find((pool) => pool.id === action.meta.arg) as PoolItemInterface;
    });
    builder.addCase(fetchPool.fulfilled, (state, action) => {
      state.pool = action.payload.pool;
      state.transactions = action.payload.transactions;
      state.chartData = action.payload.chartData;
    });
  },
});

export const { resetPoolDetails } = poolsSlice.actions;

export const selectPoolsList = (state: RootState) => state.pools.list;
export const selectPoolsPool = (state: RootState) => state.pools.pool;
export const selectPoolsChartData = (state: RootState) => state.pools.chartData;
export const selectPoolsTransactions = (state: RootState) => state.pools.transactions;

export default poolsSlice.reducer;
