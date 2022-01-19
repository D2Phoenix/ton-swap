import { createAsyncThunk } from '@reduxjs/toolkit';

import { RootState } from 'store/store';
import WalletPoolInterface from 'types/walletPoolInterface';

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
