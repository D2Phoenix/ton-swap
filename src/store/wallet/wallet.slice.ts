import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import { connectWallet, getWalletBalance } from './wallet.thunks';
import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    balances: Record<string, number>,
}

const initialState: WalletState = {
    adapter: null,
    balances: {},
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(connectWallet.fulfilled, (state, action) => {
            state.adapter = action.payload;
        })
        builder.addCase(getWalletBalance.fulfilled, (state, action) => {
            state.balances[action.payload.token.name] = action.payload.value;
        });
    },
})

export const {  } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export default walletSlice.reducer;
