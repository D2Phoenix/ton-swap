import TokenInterface from './tokenInterface';
import BigNumber from 'bignumber.js';
import { WalletTxStatus } from './transactionInterfaces';
import { SwapState } from '../store/swap/swap.slice';
import { LiquidityState } from '../store/liquidity/liquidity.slice';
import WalletPoolInterface from './walletPoolInterface';
import PoolInterface from './poolInterface';
import { InputPoolInterface } from './inputPoolInterface';

export interface WalletAdapterInterface {
    getWalletAddress(): Promise<string>;
    getBalance(token: TokenInterface): Promise<BigNumber>;
    getTokenUsePermission(token: TokenInterface): Promise<boolean>;
    setTokenUsePermission(token: TokenInterface): Promise<boolean>;
    swap(state: SwapState): Promise<WalletTxStatus>;
    addLiquidity(state: LiquidityState): Promise<WalletTxStatus>;
    getPools(): Promise<WalletPoolInterface[]>;
    getPool(one: TokenInterface, two: TokenInterface): Promise<WalletPoolInterface>;
    getPoolToken(one: TokenInterface, two: TokenInterface): Promise<PoolInterface>;
    approveRemovePool(pool: InputPoolInterface): Promise<WalletTxStatus>;
    removeLiquidity(state: LiquidityState): Promise<WalletTxStatus>;
}
