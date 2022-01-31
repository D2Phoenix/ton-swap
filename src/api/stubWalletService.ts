import BigNumber from 'bignumber.js';

import { InputPoolInterface } from 'types/inputPoolInterface';
import PoolInterface from 'types/poolInterface';
import TokenInterface from 'types/tokenInterface';
import { TransactionInterface, TxStatus } from 'types/transactionInterfaces';
import { WalletAdapterInterface } from 'types/walletAdapterInterface';
import WalletPoolInterface from 'types/walletPoolInterface';

import { LiquidityState } from 'store/liquidity/liquiditySlice';
import { SwapState } from 'store/swap/swapSlice';

const liquidity: Record<string, WalletPoolInterface> = {};

class StubWalletService implements WalletAdapterInterface {
  balances: Record<string, string> = {
    TON: '10000',
    SHIB: '5',
  };
  permissions: any = {
    TON: true,
  };

  getBalance(token: TokenInterface): Promise<string> {
    // TODO: Implement real api for wallet operation
    return new Promise<string>((resolve) => {
      resolve(this.balances[token.symbol] || '0');
    });
  }

  getBalances(tokens: TokenInterface[]): Promise<{ token: TokenInterface; value: string }[]> {
    // TODO: Implement real api for wallet operation
    return new Promise<any>((resolve) => {
      const result = [];
      for (const token of tokens) {
        result.push({
          token,
          value: this.balances[token.symbol] || '0',
        });
      }
      resolve(result);
    });
  }

  getWalletAddress(): Promise<string> {
    // TODO: Implement real api for wallet operation
    return Promise.resolve('EQAaoKr296r6YnAQsPZaJ0hbgqFK_B_GotedqpGK9FeONlSi');
  }

  getTokenUsePermission(token: TokenInterface): Promise<boolean> {
    // TODO: Implement real api for wallet operation
    return Promise.resolve(this.permissions[token.symbol] || false);
  }

  setTokenUsePermission(token: TokenInterface): Promise<boolean> {
    // TODO: Implement real api for wallet operation
    this.permissions[token.symbol] = true;
    return Promise.resolve(this.permissions[token.symbol]);
  }

  swap(state: SwapState): Promise<TxStatus> {
    // TODO: Implement real api for wallet operation
    return new Promise<TxStatus>((resolve) => {
      setTimeout(() => {
        this.balances[state.input0.token.symbol] = new BigNumber(this.balances[state.input0.token.symbol])
          .minus(state.input0.amount)
          .toString();
        this.balances[state.input1.token.symbol] = new BigNumber(
          this.balances[state.input1.token.symbol] || new BigNumber('0'),
        )
          .plus(state.input1.amount)
          .toString();
        resolve(TxStatus.CONFIRMED);
      }, 2000);
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
        this.balances[state.input0.token.symbol] = new BigNumber(this.balances[state.input0.token.symbol])
          .minus(state.input0.amount)
          .toString();
        this.balances[state.input1.token.symbol] = (
          new BigNumber(this.balances[state.input1.token.symbol]) || new BigNumber('0')
        )
          .minus(state.input1.amount)
          .toString();
        const poolName = liquidity[`${state.input1.token.symbol}:${state.input0.token.symbol}`]
          ? `${state.input1.token.symbol}:${state.input0.token.symbol}`
          : `${state.input0.token.symbol}:${state.input1.token.symbol}`;
        const pool = liquidity[poolName];
        if (pool) {
          const isReverse = poolName.startsWith(state.input1.token.symbol);
          const input0BigAmount = new BigNumber(liquidity[poolName].input0.amount);
          const input1BigAmount = new BigNumber(liquidity[poolName].input1.amount);
          const poolAmount = new BigNumber(liquidity[poolName].pool.amount);
          liquidity[poolName] = {
            input0: {
              token: liquidity[poolName].input0.token,
              amount: isReverse
                ? input0BigAmount.plus(state.input1.amount).toString()
                : input0BigAmount.plus(state.input0.amount).toString(),
            },
            input1: {
              token: liquidity[poolName].input1.token,
              amount: isReverse
                ? input1BigAmount.plus(state.input0.amount).toString()
                : input1BigAmount.plus(state.input1.amount).toString(),
            },
            pool: {
              token: liquidity[poolName].pool.token,
              amount: poolAmount.plus(state.pool.amount).toString(),
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
            },
          };
        }
        resolve(TxStatus.CONFIRMED);
      }, 2000);
    });
  }

  getPool(token0: TokenInterface, token1: TokenInterface): Promise<WalletPoolInterface> {
    // TODO: Implement real api for wallet operation
    const poolName = `${token0.symbol}:${token1.symbol}`;
    const result = liquidity[poolName] || liquidity[`${token1.symbol}:${token0.symbol}`];
    if (result) {
      return Promise.resolve({
        input0: result.input0,
        input1: result.input1,
        pool: result.pool,
      });
    }
    return Promise.resolve({
      input0: {
        token: token0,
        amount: '0',
      },
      input1: {
        token: token1,
        amount: '0',
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
        amount: '0',
        overallAmount: '100',
      },
    });
  }

  getPoolToken(token0: TokenInterface, token1: TokenInterface): Promise<PoolInterface> {
    // TODO: Implement real api for wallet operation
    const poolName = liquidity[`${token1.symbol}:${token0.symbol}`]
      ? `${token1.symbol}:${token0.symbol}`
      : `${token0.symbol}:${token1.symbol}`;
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
      };
    }
    return Promise.resolve(result);
  }

  approveRemovePool(pool: InputPoolInterface): Promise<TxStatus> {
    // TODO: Implement real api for wallet operation
    return new Promise<TxStatus>((resolve) => {
      resolve(TxStatus.CONFIRMED);
    });
  }

  removeLiquidity(state: LiquidityState): Promise<TxStatus> {
    // TODO: Implement real api for wallet operation
    return new Promise<TxStatus>((resolve) => {
      setTimeout(() => {
        this.balances[state.input0.token.symbol] = new BigNumber(this.balances[state.input0.token.symbol])
          .plus(state.input0.removeAmount!)
          .toString();
        this.balances[state.input1.token.symbol] = new BigNumber(
          this.balances[state.input1.token.symbol] || new BigNumber('0'),
        )
          .plus(state.input1.removeAmount!)
          .toString();
        const poolName = `${state.input0.token.symbol}:${state.input1.token.symbol}`;
        const input0BigAmount = new BigNumber(liquidity[poolName].input0.amount);
        const input1BigAmount = new BigNumber(liquidity[poolName].input1.amount);
        const poolAmount = new BigNumber(liquidity[poolName].pool.amount);
        liquidity[poolName] = {
          input0: {
            token: liquidity[poolName].input0.token,
            amount: input0BigAmount.minus(state.input0.removeAmount!).toString(),
          },
          input1: {
            token: liquidity[poolName].input1.token,
            amount: input1BigAmount.minus(state.input1.removeAmount!).toString(),
          },
          pool: {
            token: liquidity[poolName].pool.token,
            amount: poolAmount.minus(state.pool.removeAmount!).toString(),
            overallAmount: liquidity[poolName].pool.overallAmount,
          },
        };
        if (liquidity[poolName].pool.amount === '0') {
          delete liquidity[poolName];
        }
        resolve(TxStatus.CONFIRMED);
      }, 2000);
    });
  }

  importLiquidity(state: LiquidityState): Promise<TxStatus> {
    // TODO: Implement real api for wallet operation
    return new Promise<TxStatus>((resolve) => {
      setTimeout(() => {
        const poolName = liquidity[`${state.input1.token.symbol}:${state.input0.token.symbol}`]
          ? `${state.input1.token.symbol}:${state.input0.token.symbol}`
          : `${state.input0.token.symbol}:${state.input1.token.symbol}`;
        const pool = liquidity[poolName];
        if (!pool) {
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
            },
          };
        }
        resolve(TxStatus.CONFIRMED);
      }, 2000);
    });
  }

  checkTransactions(transactions: TransactionInterface[]): Promise<Record<string, TxStatus>> {
    return new Promise((resolve) => {
      const result: Record<string, TxStatus> = {};
      transactions.forEach((item) => {
        result[item.id] = TxStatus.SUCCEED;
      });
      resolve(result);
    });
  }
}

export default StubWalletService;
