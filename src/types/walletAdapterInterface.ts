import TokenInterface from './tokenInterface';
import BigNumber from 'bignumber.js';
import { TxStatus } from './transactionInterfaces';
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
    swap(state: SwapState): Promise<TxStatus>;
    addLiquidity(state: LiquidityState): Promise<TxStatus>;
    getPools(): Promise<WalletPoolInterface[]>;
    getPool(token0: TokenInterface, token1: TokenInterface): Promise<WalletPoolInterface>;
    getPoolToken(token0: TokenInterface, token1: TokenInterface): Promise<PoolInterface>;
    approveRemovePool(pool: InputPoolInterface): Promise<TxStatus>;
    removeLiquidity(state: LiquidityState): Promise<TxStatus>;
}
