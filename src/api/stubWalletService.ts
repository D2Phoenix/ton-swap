import BigNumber from 'bignumber.js';

import { WalletAdapterInterface } from 'interfaces/walletAdapterInterface';
import TokenInterface from '../interfaces/tokenInterface';
import { WalletTxStatus } from '../interfaces/transactionInterfaces';
import { SwapState } from '../store/swap/swap.slice';
import { LiquidityState } from '../store/liquidity/liquidity.slice';
import PoolInterface from '../interfaces/poolInterface';

const permissions: any = {
    'TON': true,
};

const balances: Record<string, BigNumber> = {
    'TON': new BigNumber('10000000000000'),
    'SHIB': new BigNumber('5000000000000000000')
}

const liquidity: Record<string, PoolInterface> = {
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
                balances[state.from.token!.symbol] = balances[state.from.token!.symbol].minus(state.from.amount!);
                balances[state.to.token!.symbol] = (balances[state.to.token!.symbol] || new BigNumber('0')).plus(state.to.amount!)
                resolve(WalletTxStatus.CONFIRMED);
            }, 3000)
        });
    }

    getPools(): Promise<PoolInterface[]> {
        return Promise.resolve(Object.values(liquidity));
    }

    addLiquidity(state: LiquidityState): Promise<WalletTxStatus> {
        // TODO: Implement real api for wallet operation
        return new Promise<WalletTxStatus>((resolve) => {
            setTimeout(() => {
                balances[state.one.token!.symbol] = balances[state.one.token!.symbol].minus(state.one.amount!);
                balances[state.two.token!.symbol] = (balances[state.two.token!.symbol] || new BigNumber('0')).minus(state.two.amount!);
                const poolName = liquidity[`${state.two.token!.symbol}_${state.one.token!.symbol}`] ?
                    `${state.two.token!.symbol}_${state.one.token!.symbol}` :
                    `${state.one.token!.symbol}_${state.two.token!.symbol}`
                const pool = liquidity[poolName];
                if (pool) {
                    liquidity[poolName] = {
                        one: {
                            token: liquidity[poolName].one.token,
                            amount: liquidity[poolName].one.amount!.plus(state.one.amount!),
                        },
                        two: {
                            token: liquidity[poolName].two.token,
                            amount: liquidity[poolName].two.amount!.plus(state.two.amount!),
                        },
                        details: {
                            poolAmount: liquidity[poolName].details.poolAmount.plus(state.details.poolAmount),
                            poolTokens: liquidity[poolName].details.poolTokens,
                        },
                    };
                } else {
                    liquidity[poolName] = {
                        one: state.one,
                        two: state.two,
                        details: state.details,
                    };
                }
                resolve(WalletTxStatus.CONFIRMED);
            }, 3000)
        });
    };


}

export default StubWalletService;
