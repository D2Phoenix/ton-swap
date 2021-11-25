import TokenInterface from './tokenInterface';
import BigNumber from 'bignumber.js';
import { WalletTransactionStatus } from './transactionInterfaces';
import { SwapState } from '../store/swap/swap.slice';

export interface WalletAdapterInterface {
    getWalletAddress(): Promise<string>;
    getBalance(token: TokenInterface): Promise<BigNumber>;
    getTokenUsePermission(token: TokenInterface): Promise<boolean>;
    setTokenUsePermission(token: TokenInterface): Promise<boolean>;
    swap(fromToken: SwapState): Promise<WalletTransactionStatus>
}
