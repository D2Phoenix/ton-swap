import TokenInterface from './tokenInterface';
import { TxStatus } from './transactionInterfaces';
import { SwapState } from '../store/swap/swapSlice';
import { LiquidityState } from '../store/liquidity/liquiditySlice';
import WalletPoolInterface from './walletPoolInterface';
import PoolInterface from './poolInterface';
import { InputPoolInterface } from './inputPoolInterface';

export enum WalletStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTED = 'CONNECTED',
    CONNECTING = 'CONNECTING',
}

export interface WalletAdapterInterface {
    getWalletAddress(): Promise<string>;
    getBalance(token: TokenInterface): Promise<string>;
    getBalances(tokens: TokenInterface[]): Promise<any>;
    getTokenUsePermission(token: TokenInterface): Promise<boolean>;
    setTokenUsePermission(token: TokenInterface): Promise<boolean>;
    swap(state: SwapState): Promise<TxStatus>;
    addLiquidity(state: LiquidityState): Promise<TxStatus>;
    removeLiquidity(state: LiquidityState): Promise<TxStatus>;
    importLiquidity(state: LiquidityState): Promise<TxStatus>;
    getPools(): Promise<WalletPoolInterface[]>;
    getPool(token0: TokenInterface, token1: TokenInterface): Promise<WalletPoolInterface>;
    getPoolToken(token0: TokenInterface, token1: TokenInterface): Promise<PoolInterface>;
    approveRemovePool(pool: InputPoolInterface): Promise<TxStatus>;
}
