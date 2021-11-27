import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from 'store/store';

import { fetchPool, fetchPools } from './pools.thunks';
import PoolItemInterface from 'interfaces/poolItemInterface';

interface PoolState {
    list: PoolItemInterface[],
    pool: PoolItemInterface,
    chartData: any[];
    transactions: any;
}

const initialState: PoolState = {
    list: [],
    pool: null as any,
    chartData: [],
    transactions: null,
}

export const poolsSlice = createSlice({
    name: 'pools',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPools.fulfilled, (state, action) => {
            state.list = action.payload;
        });
        builder.addCase(fetchPool.fulfilled, (state, action) => {
            state.pool = action.payload.pool;
            state.transactions = action.payload.transactions;
            state.chartData = action.payload.chartData;
        })
    },
})

export const {  } = poolsSlice.actions

export const selectPoolsList = (state: RootState) => state.pools.list;

export default poolsSlice.reducer;
