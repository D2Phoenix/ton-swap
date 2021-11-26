import { createAsyncThunk } from '@reduxjs/toolkit';

import { getTokens } from 'api/tokens';
import TokenInterface from 'interfaces/tokenInterface';
import { getPools } from '../../api/pools';
import PoolListInterface from '../../interfaces/poolListInterface';

export const fetchPools = createAsyncThunk(
    'pools/list',
    async (): Promise<PoolListInterface[]> => {
        return await getPools();
    },
)
