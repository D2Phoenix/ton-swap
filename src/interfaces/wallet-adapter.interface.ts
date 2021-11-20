import TokenInterface from './token.interface';
import BigNumber from 'bignumber.js';

export interface WalletAdapterInterface {
    getWalletAddress(): Promise<string>;
    getBalance(token: TokenInterface): Promise<BigNumber>;
}
