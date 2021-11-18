import { createSlice, PayloadAction} from '@reduxjs/toolkit'

import type { RootState } from 'store/store'
import TokenInterface from 'interfaces/token.interface';
import { fetchTokens } from './app.thunks';

interface AppState {
    tokens: TokenInterface[]
}

const initialState: AppState = {
    tokens: [],
}

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setTokens: (state, action: PayloadAction<any[]>) => {
            state.tokens = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTokens.fulfilled, (state, action) => {
            state.tokens = action.payload;
        })
    },
})

export const { setTokens } = appSlice.actions

export const selectTokens = (state: RootState) => state.app.tokens;

export default appSlice.reducer;
