import { createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from '../store';
import PoolInterface from '../../interfaces/poolInterface';

export const getPoolPools = createAsyncThunk(
    'pool/pools',
    async (request, thunkAPI): Promise<PoolInterface[]> => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        if (walletAdapterService) {
            return walletAdapterService.getPools();
        }
        return [];
    },
)
