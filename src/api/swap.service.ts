import { SwapTransactionRequestInterface } from '../interfaces/swap-transaction-request.interface';
import { SwapTransactionInterface } from '../interfaces/swap-transaction.interface';
import { SwapType } from '../interfaces/swap.type';

// Swap service is a stub
class SwapService {
    getTransactionEstimation(data: SwapTransactionRequestInterface): Promise<SwapTransactionInterface> {
        return Promise.resolve({
            amount: data.type === SwapType.EXACT_IN ? data.fromAmount : data.toAmount,
            quote: data.type === SwapType.EXACT_IN ? data.fromAmount : data.toAmount,
            type: data.type
        });
    }
}

export default SwapService
