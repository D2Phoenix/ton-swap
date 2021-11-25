import { TransactionType } from './transactionInterfaces';
import { InputTokenInterface } from './inputTokenInterface';

export interface LiquidityTransactionRequestInterface {
    one?: InputTokenInterface;
    two?: InputTokenInterface;
    txType: TransactionType;
}
