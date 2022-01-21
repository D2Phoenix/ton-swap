import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';

import { SettingsInterface } from 'types/settingsInterface';
import TokenInterface from 'types/tokenInterface';
import TokenListInterface from 'types/tokenListInterface';

import type { RootState } from 'store/store';

import { fetchTokens } from './appThunks';

interface AppState {
  tokens: TokenInterface[];
  tokenLists: TokenListInterface[];
  settings: SettingsInterface;
}

const initialState: AppState = {
  tokens: [],
  tokenLists: [],
  settings: {
    slippage: DEFAULT_SLIPPAGE,
    deadline: DEFAULT_DEADLINE,
  },
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<any[]>) => {
      state.tokens = action.payload;
    },
    setSettingsSlippage: (state, action: PayloadAction<any>) => {
      state.settings.slippage = action.payload;
    },
    setSettingsDeadline: (state, action: PayloadAction<any>) => {
      state.settings.deadline = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTokens.fulfilled, (state, action) => {
      state.tokens = action.payload;
    });
  },
});

export const { setTokens, setSettingsSlippage, setSettingsDeadline } = appSlice.actions;

export const selectTokens = (state: RootState) => state.app.tokens;
export const selectTokenLists = (state: RootState) => state.app.tokenLists;
export const selectSettings = (state: RootState) => state.app.settings;

export default appSlice.reducer;
