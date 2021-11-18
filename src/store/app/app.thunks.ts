import { createAsyncThunk } from '@reduxjs/toolkit';

import { getTokens } from 'api/tokens';
import TokenInterface from 'interfaces/token.interface';

export const fetchTokens = createAsyncThunk(
    'app/fetchTokens',
    async () => {
        const response = await getTokens()
        return response.tokens
            .sort((a: TokenInterface, b: TokenInterface) => (a.symbol > b.symbol) ? 1 : ((b.symbol > a.symbol) ? -1 : 0));
    }
)
