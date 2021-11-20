import { createAsyncThunk } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import TokenInterface from 'interfaces/token.interface';
import { RootState } from 'store/store';
import StubWalletService from 'api/stub-wallet.service';

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const adapter = new StubWalletService();
        const balances: Record<string, BigNumber> = {};
        if (state.swap.from) {
            balances[state.swap.from.symbol] = await adapter.getBalance(state.swap.from);
        }
        if (state.swap.to) {
            balances[state.swap.to.symbol] = await adapter.getBalance(state.swap.to);
        }
        return {
            adapter,
            address: await adapter.getWalletAddress(),
            balances
        }
    }
)

export const getWalletBalance = createAsyncThunk(
    'wallet/balance',
    async (token: TokenInterface, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return {
            token,
            value: walletAdapterService ? await walletAdapterService.getBalance(token) : new BigNumber(0),
        };
    }
)

export const getWalletAddress = createAsyncThunk(
    'wallet/address',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        if (walletAdapterService) {
            return await walletAdapterService.getWalletAddress()
        }
        return '';
    }
)
