import { createAsyncThunk } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import TokenInterface from 'interfaces/tokenInterface';
import { RootState } from 'store/store';
import StubWalletService from 'api/stubWalletService';
import { WalletTransactionStatus } from '../../interfaces/transactionInterfaces';

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const adapter = new StubWalletService();
        const balances: Record<string, BigNumber> = {};
        const permissions: Record<string, boolean> = {};
        if (state.swap.from.token) {
            balances[state.swap.from.token.symbol] = await adapter.getBalance(state.swap.from.token);
            permissions[state.swap.from.token.symbol] = await adapter.getTokenUsePermission(state.swap.from.token);
        }
        if (state.swap.to.token) {
            balances[state.swap.to.token.symbol] = await adapter.getBalance(state.swap.to.token);
            permissions[state.swap.to.token.symbol] = await adapter.getTokenUsePermission(state.swap.to.token);
        }
        return {
            adapter,
            address: await adapter.getWalletAddress(),
            balances,
            permissions,
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

export const getWalletUseTokenPermission = createAsyncThunk(
    'wallet/token/usePermission',
    async (token: TokenInterface, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return {
            token,
            value: walletAdapterService ? await walletAdapterService.getTokenUsePermission(token) : true,
        };
    }
)

export const setWalletUseTokenPermission = createAsyncThunk(
    'wallet/token/setPermission',
    async (token: TokenInterface, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        return {
            token,
            value: walletAdapterService ? await walletAdapterService.setTokenUsePermission(token) : true,
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

export const walletSwap = createAsyncThunk(
    'wallet/swap',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        if (walletAdapterService) {
            return await walletAdapterService.swap(state.swap)
        }
        return WalletTransactionStatus.INITIAL;
    }
)
