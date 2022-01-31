import { createAsyncThunk } from '@reduxjs/toolkit';

import WalletPoolInterface from 'types/walletPoolInterface';

import { RootState } from 'store/store';

export const getPoolPools = createAsyncThunk(
  'pool/pools',
  async (request, thunkAPI): Promise<WalletPoolInterface[]> => {
    const state = thunkAPI.getState() as RootState;
    const walletAdapterService = state.wallet.adapter;
    if (walletAdapterService) {
      return walletAdapterService.getPools();
    }
    return [];
  },
);
