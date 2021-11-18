import { createAsyncThunk } from '@reduxjs/toolkit';

import { getTokens } from 'api/tokens';
import TokenInterface from 'interfaces/token.interface';

export const fetchTokens = createAsyncThunk(
    'app/tokens',
    async () => {
        const response = await getTokens()
        return response.tokens
            .sort((a: TokenInterface, b: TokenInterface) => ((a.symbol === 'TON' || b.symbol === 'TON') ? 1
                : (a.symbol > b.symbol)) ? 1
                    : ((b.symbol > a.symbol) ? -1 : 0)
            );
    }
)
