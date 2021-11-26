import { createAsyncThunk } from '@reduxjs/toolkit';

import PoolsService from 'api/poolsService';
import PoolListInterface from 'interfaces/poolListInterface';

const poolsService = new PoolsService();

export const fetchPools = createAsyncThunk(
    'pools/list',
    async (): Promise<PoolListInterface[]> => {
        return await poolsService.getPools();
    },
)
