import { createAsyncThunk } from '@reduxjs/toolkit';

import { SwapTransactionRequestInterface } from '../../interfaces/swap-transaction-request.interface';
import SwapService from '../../api/swap.service';
import { SwapType } from '../../interfaces/swap.type';

const swapService = new SwapService();

export const estimateTransaction = createAsyncThunk(
    'swap/estimate',
    async (data: SwapTransactionRequestInterface) => {
        const estimation = await swapService.getTransactionEstimation(data);
        return {
            fromAmount: estimation.type === SwapType.EXACT_IN ? estimation.amount : estimation.quote,
            toAmount: estimation.type === SwapType.EXACT_IN ? estimation.quote : estimation.amount,
            type: data.type,
        }
    }
)
