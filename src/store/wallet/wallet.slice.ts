import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import { connectWallet, getWalletAddress, getWalletBalance } from './wallet.thunks';
import { WalletAdapterInterface } from 'interfaces/wallet-adapter.interface';

interface WalletState {
    adapter: WalletAdapterInterface | null,
    address: string;
    balances: Record<string, number>,
}

const initialState: WalletState = {
    adapter: null,
    address: '',
    balances: {},
}

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(connectWallet.fulfilled,  (state, action) => {
            state.adapter = action.payload.adapter;
            state.address = action.payload.address;
            state.balances = action.payload.balances
        })
        builder.addCase(getWalletBalance.fulfilled, (state, action) => {
            state.balances[action.payload.token.symbol] = action.payload.value;
        });
        builder.addCase(getWalletAddress.fulfilled, (state, action) => {
            state.address = action.payload;
        });
    },
})

export const {  } = walletSlice.actions

export const selectWalletBalances = (state: RootState) => state.wallet.balances;

export const selectWalletAdapter = (state: RootState) => state.wallet.adapter;

export default walletSlice.reducer;
