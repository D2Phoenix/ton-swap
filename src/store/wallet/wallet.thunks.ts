import { createAsyncThunk } from '@reduxjs/toolkit';

import TokenInterface from 'interfaces/token.interface';
import { RootState } from 'store/store';
import StubWalletService from '../../api/stub-wallet.service';

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async () => {
        return new StubWalletService();
    }
)

export const getWalletBalance = createAsyncThunk(
    'wallet/balance',
    async (token: TokenInterface, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return {
            token,
            value: walletAdapterService ? await walletAdapterService.getBalance(token) : 0,
        };
    }
)
