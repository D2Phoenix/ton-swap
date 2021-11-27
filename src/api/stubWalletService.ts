import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';
import TokenInterface from '../interfaces/tokenInterface';
import { WalletTxStatus } from '../interfaces/transactionInterfaces';
import { SwapState } from '../store/swap/swap.slice';
import { LiquidityState } from '../store/liquidity/liquidity.slice';
import WalletPoolInterface from '../interfaces/walletPoolInterface';
import PoolInterface from '../interfaces/poolInterface';
import { InputPoolInterface } from '../interfaces/inputPoolInterface';

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

    swap(state: SwapState): Promise<WalletTxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.from.token.symbol] = balances[state.from.token.symbol].minus(state.from.amount);
                balances[state.to.token.symbol] = (balances[state.to.token.symbol] || new BigNumber('0')).plus(state.to.amount)
                resolve(WalletTxStatus.CONFIRMED);
            }, 2000)
        });
    }

    getPools(): Promise<WalletPoolInterface[]> {
        // TODO: Implement real api for wallet operation
        return Promise.resolve(Object.values(liquidity));
    }

    addLiquidity(state: LiquidityState): Promise<WalletTxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.one.token.symbol] = balances[state.one.token.symbol].minus(state.one.amount);
                balances[state.two.token.symbol] = (balances[state.two.token.symbol] || new BigNumber('0')).minus(state.two.amount);
                const poolName = liquidity[`${state.two.token.symbol}:${state.one.token.symbol}`] ?
                    `${state.two.token.symbol}:${state.one.token.symbol}` :
                    `${state.one.token.symbol}:${state.two.token.symbol}`
                const pool = liquidity[poolName];
                if (pool) {
                    const isReverse = poolName.startsWith(state.two.token.symbol);
                    liquidity[poolName] = {
                        one: {
                            token: liquidity[poolName].one.token,
                            amount: isReverse ? liquidity[poolName].one.amount.plus(state.two.amount) : liquidity[poolName].one.amount.plus(state.one.amount),
                        },
                        two: {
                            token: liquidity[poolName].two.token,
                            amount: isReverse ? liquidity[poolName].two.amount.plus(state.one.amount) : liquidity[poolName].two.amount.plus(state.two.amount),
                        },
                        pool: {
                            token: liquidity[poolName].pool.token,
                            amount: liquidity[poolName].pool.amount.plus(state.pool.amount),
                            overallAmount: liquidity[poolName].pool.overallAmount,
                        },
                    };
                } else {
                    liquidity[poolName] = {
                        one: state.one,
                        two: state.two,
                        pool: {
                            ...state.pool,
                            token: {
                                symbol: poolName,
                                name: poolName,
                                address0: state.one.token.address,
                                address1: state.two.token.address,
                                decimals: 0,
                                chainId: 1,
                                address: poolName,
                            },
                        }
                    };
                }
                resolve(WalletTxStatus.CONFIRMED);
            }, 2000)
        });
    };

    getPool(one: TokenInterface, two: TokenInterface): Promise<WalletPoolInterface> {
        // TODO: Implement real api for wallet operation
        const poolName = `${one.symbol}:${two.symbol}`;
        const result = liquidity[`${one.symbol}:${two.symbol}`];
        if (result) {
            return Promise.resolve({
                one: result.one,
                two: result.two,
                pool: result.pool
            });
        }
        return Promise.resolve({
            one: {
                token: one,
                amount: new BigNumber('0'),
            },
            two: {
                token: two,
                amount: new BigNumber('0'),
            },
            pool: {
                token: {
                    symbol: poolName,
                    name: poolName,
                    address0: one.address,
                    address1: two.address,
                    decimals: 0,
                    chainId: 1,
                    address: poolName,
                },
                amount: new BigNumber('0'),
                overallAmount: new BigNumber('100'),
            }
        });
    }

    getPoolToken(one: TokenInterface, two: TokenInterface): Promise<PoolInterface> {
        // TODO: Implement real api for wallet operation
        const poolName = liquidity[`${two.symbol}:${one.symbol}`] ?
            `${two.symbol}:${one.symbol}` :
            `${one.symbol}:${two.symbol}`;
        let result: PoolInterface;
        if (liquidity[poolName]) {
            result = liquidity[poolName].pool.token;
        } else {
            result = {
                symbol: poolName,
                name: poolName,
                address0: one.address,
                address1: two.address,
                decimals: 0,
                chainId: 1,
                address: poolName,
            }
        }
        return Promise.resolve(result);
    }

    approveRemovePool(pool: InputPoolInterface): Promise<WalletTxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTxStatus>((resolve) => {
                setTimeout(() => {
                    resolve(WalletTxStatus.CONFIRMED);
                }, 2000);
            }
        );
    }

    removeLiquidity(state: LiquidityState): Promise<WalletTxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.one.token.symbol] = balances[state.one.token.symbol].plus(state.one.removeAmount!);
                balances[state.two.token.symbol] = (balances[state.two.token.symbol] || new BigNumber('0')).plus(state.two.removeAmount!);
                const poolName = `${state.one.token.symbol}:${state.two.token.symbol}`
                liquidity[poolName] = {
                    one: {
                        token: liquidity[poolName].one.token,
                        amount: liquidity[poolName].one.amount.minus(state.one.removeAmount!),
                    },
                    two: {
                        token: liquidity[poolName].two.token,
                        amount: liquidity[poolName].two.amount.minus(state.two.removeAmount!),
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
                resolve(WalletTxStatus.CONFIRMED);
            }, 2000)
        });
    };

}

export default StubWalletService;
