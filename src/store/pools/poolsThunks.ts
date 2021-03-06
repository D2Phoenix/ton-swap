import { createAsyncThunk } from '@reduxjs/toolkit';

import PoolItemInterface from 'types/poolItemInterface';

import PoolsService from 'api/poolsService';

import { RootState } from 'store/store';

const poolsService = new PoolsService();

export const fetchPools = createAsyncThunk('pools/list', async (): Promise<PoolItemInterface[]> => {
  return await poolsService.getPools();
});

export const fetchPool = createAsyncThunk('pools/pool', async (poolAddress: string, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const pools = state.pools.list.length ? state.pools.list : await poolsService.getPools();
  return {
    pool: pools.find((pool) => pool.id === poolAddress) as PoolItemInterface,
    chartData: await poolsService.getPoolDayData(poolAddress),
    transactions: await poolsService.getPoolTransactions(poolAddress),
  };
});
