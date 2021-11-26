import { createSlice} from '@reduxjs/toolkit';
import type { RootState } from 'store/store';

import { fetchPools } from './pools.thunks';
import PoolListInterface from 'interfaces/poolListInterface';

interface PoolState {
    list: PoolListInterface[],
}

const initialState: PoolState = {
    list: [],
}

export const poolsSlice = createSlice({
    name: 'pools',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPools.fulfilled, (state, action) => {
            state.list = action.payload;
        })
    },
})

export const {  } = poolsSlice.actions

export const selectPoolsList = (state: RootState) => state.pools.list;

export default poolsSlice.reducer;
