import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'types/walletAdapterInterface';
import TokenInterface from '../types/tokenInterface';
import { TxStatus } from '../types/transactionInterfaces';
import { SwapState } from '../store/swap/swap.slice';
import { LiquidityState } from '../store/liquidity/liquidity.slice';
import WalletPoolInterface from '../types/walletPoolInterface';
import PoolInterface from '../types/poolInterface';
import { InputPoolInterface } from '../types/inputPoolInterface';

const permissions: any = {
    'TON': true,
};

const balances: Record<string, BigNumber> = {
    'TON': new BigNumber('10000000000000'),
    'SHIB': new BigNumber('5000000000000000000')
}

const liquidity: Record<string, WalletPoolInterface> = {
};

class StubWalletService implements WalletAdapterInterface {
    getBalance(token: TokenInterface): Promise<BigNumber> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(balances[token.symbol] || new BigNumber('0'));
    }

    getWalletAddress(): Promise<string> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve('EQAaoKr296r6YnAQsPZaJ0hbgqFK_B_GotedqpGK9FeONlSi');
    }

    getTokenUsePermission(token: TokenInterface): Promise<boolean> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(permissions[token.symbol] || false);
    };

    setTokenUsePermission(token: TokenInterface): Promise<boolean> {
        // TODO: Implement real api for wallet operation
        permissions[token.symbol] = true;
        return Promise.resolve(permissions[token.symbol])
    };

    swap(state: SwapState): Promise<TxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<TxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.input0.token.symbol] = balances[state.input0.token.symbol].minus(state.input0.amount);
                balances[state.input1.token.symbol] = (balances[state.input1.token.symbol] || new BigNumber('0')).plus(state.input1.amount)
                resolve(TxStatus.CONFIRMED);
            }, 2000)
        });
    }

    getPools(): Promise<WalletPoolInterface[]> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(Object.values(liquidity));
    }

    addLiquidity(state: LiquidityState): Promise<TxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<TxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.input0.token.symbol] = balances[state.input0.token.symbol].minus(state.input0.amount);
                balances[state.input1.token.symbol] = (balances[state.input1.token.symbol] || new BigNumber('0')).minus(state.input1.amount);
                const poolName = liquidity[`${state.input1.token.symbol}:${state.input0.token.symbol}`] ?
                    `${state.input1.token.symbol}:${state.input0.token.symbol}` :
                    `${state.input0.token.symbol}:${state.input1.token.symbol}`
                const pool = liquidity[poolName];
                if (pool) {
                    const isReverse = poolName.startsWith(state.input1.token.symbol);
                    liquidity[poolName] = {
                        input0: {
                            token: liquidity[poolName].input0.token,
                            amount: isReverse ? liquidity[poolName].input0.amount.plus(state.input1.amount) : liquidity[poolName].input0.amount.plus(state.input0.amount),
                        },
                        input1: {
                            token: liquidity[poolName].input1.token,
                            amount: isReverse ? liquidity[poolName].input1.amount.plus(state.input0.amount) : liquidity[poolName].input1.amount.plus(state.input1.amount),
                        },
                        pool: {
                            token: liquidity[poolName].pool.token,
                            amount: liquidity[poolName].pool.amount.plus(state.pool.amount),
                            overallAmount: liquidity[poolName].pool.overallAmount,
                        },
                    };
                } else {
                    liquidity[poolName] = {
                        input0: state.input0,
                        input1: state.input1,
                        pool: {
                            ...state.pool,
                            token: {
                                symbol: poolName,
                                name: poolName,
                                address0: state.input0.token.address,
                                address1: state.input1.token.address,
                                decimals: 0,
                                chainId: 1,
                                address: poolName,
                            },
                        }
                    };
                }
                resolve(TxStatus.CONFIRMED);
            }, 2000)
        });
    };

    getPool(token0: TokenInterface, token1: TokenInterface): Promise<WalletPoolInterface> {
        // TODO: Implement real api for wallet operation
        const poolName = `${token0.symbol}:${token1.symbol}`;
        const result = liquidity[`${token0.symbol}:${token1.symbol}`];
        if (result) {
            return Promise.resolve({
                input0: result.input0,
                input1: result.input1,
                pool: result.pool
            });
        }
        return Promise.resolve({
            input0: {
                token: token0,
                amount: new BigNumber('0'),
            },
            input1: {
                token: token1,
                amount: new BigNumber('0'),
            },
            pool: {
                token: {
                    symbol: poolName,
                    name: poolName,
                    address0: token0.address,
                    address1: token1.address,
                    decimals: 0,
                    chainId: 1,
                    address: poolName,
                },
                amount: new BigNumber('0'),
                overallAmount: new BigNumber('100'),
            }
        });
    }

    getPoolToken(token0: TokenInterface, token1: TokenInterface): Promise<PoolInterface> {
        // TODO: Implement real api for wallet operation
        const poolName = liquidity[`${token1.symbol}:${token0.symbol}`] ?
            `${token1.symbol}:${token0.symbol}` :
            `${token0.symbol}:${token1.symbol}`;
        let result: PoolInterface;
        if (liquidity[poolName]) {
            result = liquidity[poolName].pool.token;
        } else {
            result = {
                symbol: poolName,
                name: poolName,
                address0: token0.address,
                address1: token1.address,
                decimals: 0,
                chainId: 1,
                address: poolName,
            }
        }
        return Promise.resolve(result);
    }

    approveRemovePool(pool: InputPoolInterface): Promise<TxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<TxStatus>((resolve) => {
                setTimeout(() => {
                    resolve(TxStatus.CONFIRMED);
                }, 2000);
            }
        );
    }

    removeLiquidity(state: LiquidityState): Promise<TxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<TxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.input0.token.symbol] = balances[state.input0.token.symbol].plus(state.input0.removeAmount!);
                balances[state.input1.token.symbol] = (balances[state.input1.token.symbol] || new BigNumber('0')).plus(state.input1.removeAmount!);
                const poolName = `${state.input0.token.symbol}:${state.input1.token.symbol}`
                liquidity[poolName] = {
                    input0: {
                        token: liquidity[poolName].input0.token,
                        amount: liquidity[poolName].input0.amount.minus(state.input0.removeAmount!),
                    },
                    input1: {
                        token: liquidity[poolName].input1.token,
                        amount: liquidity[poolName].input1.amount.minus(state.input1.removeAmount!),
                    },
                    pool: {
                        token: liquidity[poolName].pool.token,
                        amount: liquidity[poolName].pool.amount.minus(state.pool.removeAmount!),
                        overallAmount: liquidity[poolName].pool.overallAmount,
                    },
                };
                if (liquidity[poolName].pool.amount.eq('0')) {
                    delete liquidity[poolName];
                }
                resolve(TxStatus.CONFIRMED);
            }, 2000)
        });
    };

}

export default StubWalletService;
