import { createSlice, PayloadAction} from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import TokenInterface from 'types/tokenInterface';
import { fetchTokens } from './appThunks';
import { DEFAULT_DEADLINE, DEFAULT_SLIPPAGE } from 'constants/swap';
import { SettingsInterface } from 'types/settingsInterface';

interface AppState {
    tokens: TokenInterface[],
    settings: SettingsInterface;
}

const initialState: AppState = {
    tokens: [],
    settings: {
        slippage: DEFAULT_SLIPPAGE,
        deadline: DEFAULT_DEADLINE,
    },
}

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
        })
    },
})

export const { setTokens, setSettingsSlippage, setSettingsDeadline } = appSlice.actions

export const selectTokens = (state: RootState) => state.app.tokens;
export const selectSettings = (state: RootState) => state.app.settings;

export default appSlice.reducer;
