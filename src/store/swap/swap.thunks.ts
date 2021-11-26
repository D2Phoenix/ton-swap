import { createAsyncThunk } from '@reduxjs/toolkit';

import { SwapTxInRequestInterface, SwapTxOutRequestInterface } from '../../interfaces/swapTxRequestInterface';
import SmartContractsService from '../../api/smartContractsService';
import { TxType } from '../../interfaces/transactionInterfaces';

const swapService = new SmartContractsService();

export const estimateTransaction = createAsyncThunk(
    'swap/estimate',
    async (data: SwapTxInRequestInterface | SwapTxOutRequestInterface) => {
        const transaction = await swapService.getTxEstimation(data);
        const priceImpact = await swapService.getPriceImpact(data, transaction);
        const insufficientLiquidity = !await swapService.checkLiquidity(data, transaction);
        return {
            fromAmount: transaction.txType === TxType.EXACT_IN ? transaction.amount : transaction.quote,
            toAmount: transaction.txType === TxType.EXACT_IN ? transaction.quote : transaction.amount,
            fee: transaction.fee,
            type: data.txType,
            priceImpact,
            insufficientLiquidity,
        }
    }
);
