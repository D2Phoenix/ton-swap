import PoolItemInterface from 'types/poolItemInterface';
import BigNumber from 'bignumber.js';

class PoolsService {
  getPools(): Promise<PoolItemInterface[]> {
    return Promise.all([
      this.getPoolByDate('pools.json'),
      this.getPoolByDate('pools24.json'),
      this.getPoolByDate('pools48.json'),
      this.getPoolByDate('pools7d.json'),
    ]).then(([pools, pools24, pools48, pools7d]) => {
      return pools.map((pool: PoolItemInterface, index: number): PoolItemInterface => {
        const pool24 = pools24.find((item: PoolItemInterface) => item.id === pool.id);
        const pool48 = pools48.find((item: PoolItemInterface) => item.id === pool.id);
        const pool7d = pools7d.find((item: PoolItemInterface) => item.id === pool.id);
        return {
          ...pool,
          volume24USD: new BigNumber(pool.volumeUSD).minus(pool24.volumeUSD).toString(),
          volume7dUSD: new BigNumber(pool.volumeUSD).minus(pool7d.volumeUSD).toString(),
          volume24Change: new BigNumber('100')
            .minus(
              new BigNumber('100')
                .multipliedBy(new BigNumber(pool24.volumeUSD).minus(pool48.volumeUSD))
                .div(new BigNumber(pool.volumeUSD).minus(pool24.volumeUSD)),
            )
            .toString(),
          totalValueLockedChange: new BigNumber('100')
            .minus(new BigNumber('100').multipliedBy(pool24.totalValueLockedUSD).div(pool.totalValueLockedUSD))
            .toString(),
        };
      });
    });
  }

  getPoolDayData(poolAddress: string): Promise<any> {
    return fetch(`/data/volume.json`)
      .then((response) => response.json())
      .then((response) => response.data.poolDayDatas)
      .then((response) =>
        response.map((data: any) => ({
          date: data.date,
          feesUSD: new BigNumber(data.feesUSD).toNumber(),
          tvlUSD: new BigNumber(data.tvlUSD).toNumber(),
          volumeUSD: new BigNumber(data.volumeUSD).toNumber(),
        })),
      );
  }

  getPoolTransactions(poolAddress: string): Promise<any> {
    return fetch(`/data/transactions.json`)
      .then((response) => response.json())
      .then((response) => [...response.data.burns, ...response.data.mints, ...response.data.swaps]);
  }

  private getPoolByDate(name: string) {
    return fetch(`/data/${name}`)
      .then((response) => response.json())
      .then((response) => response.data.pools);
  }
}

export default PoolsService;
