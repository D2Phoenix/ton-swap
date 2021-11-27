import { createAsyncThunk } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

import TokenInterface from 'interfaces/tokenInterface';
import { RootState } from 'store/store';
import StubWalletService from 'api/stubWalletService';
import { WalletTxStatus } from '../../interfaces/transactionInterfaces';

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const adapter = new StubWalletService();
        const balances: Record<string, BigNumber> = {};
        const permissions: Record<string, boolean> = {};
        if (state.swap.input0.token) {
            balances[state.swap.input0.token.symbol] = await adapter.getBalance(state.swap.input0.token);
            permissions[state.swap.input0.token.symbol] = await adapter.getTokenUsePermission(state.swap.input0.token);
        }
        if (state.swap.input1.token) {
            balances[state.swap.input1.token.symbol] = await adapter.getBalance(state.swap.input1.token);
            permissions[state.swap.input1.token.symbol] = await adapter.getTokenUsePermission(state.swap.input1.token);
        }
        if (state.liquidity.input0.token) {
            balances[state.liquidity.input0.token.symbol] = await adapter.getBalance(state.liquidity.input0.token);
            permissions[state.liquidity.input0.token.symbol] = await adapter.getTokenUsePermission(state.liquidity.input0.token);
        }
        if (state.liquidity.input1.token) {
            balances[state.liquidity.input1.token.symbol] = await adapter.getBalance(state.liquidity.input1.token);
            permissions[state.liquidity.input1.token.symbol] = await adapter.getTokenUsePermission(state.liquidity.input1.token);
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

export const getWalletBalances = createAsyncThunk(
    'wallet/balances',
    async (tokens: TokenInterface[], thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        const result = [];
        for (const token of tokens) {
            result.push({
                token,
                value: walletAdapterService ? await walletAdapterService.getBalance(token) : new BigNumber(0),
            })
        }
        return result;
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
        return WalletTxStatus.INITIAL;
    }
)

export const walletAddLiquidity = createAsyncThunk(
    'wallet/liquidity/add',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        if (walletAdapterService) {
            return await walletAdapterService.addLiquidity(state.liquidity)
        }
        return WalletTxStatus.INITIAL;
    }
)

export const walletRemoveLiquidity = createAsyncThunk(
    'wallet/liquidity/remove',
    async (request, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const walletAdapterService = state.wallet.adapter;
        if (walletAdapterService) {
            return await walletAdapterService.removeLiquidity(state.liquidity)
        }
        return WalletTxStatus.INITIAL;
    }
)
