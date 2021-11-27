import PoolItemInterface from 'interfaces/poolItemInterface';
import BigNumber from 'bignumber.js';

class PoolsService {
    getPools(): Promise<PoolItemInterface[]> {
        return Promise.all([
            this.getPoolByDate('pools.json'),
            this.getPoolByDate('pools24.json'),
            this.getPoolByDate('pools48.json'),
            this.getPoolByDate('pools7d.json')
        ]).then(([pools, pools24, pools48, pools7d]) => {
            return pools.map((pool: PoolItemInterface, index: number) => {
                const pool24 = pools24.find((item: PoolItemInterface) => item.id === pool.id);
                const pool7d = pools7d.find((item: PoolItemInterface) => item.id === pool.id);
                return {
                    ...pool,
                    volume24USD: new BigNumber(pool.volumeUSD).minus(pool24.volumeUSD).toString(),
                    volume7dUSD: new BigNumber(pool.volumeUSD).minus(pool7d.volumeUSD).toString(),
                }
            });
        })
    }

    getPoolDayData(poolAddress: string): Promise<any> {
        return fetch(`/data/volume.json`)
            .then((response) => response.json())
            .then(response => response.data.poolDayDatas)
    }

    getPoolTransactions(poolAddress: string): Promise<any> {
        return fetch(`/data/transactions.json`)
            .then((response) => response.json())
            .then(response => response.data)
    }

    private getPoolByDate(name: string) {
        return fetch(`/data/${name}`)
            .then((response) => response.json())
            .then(response => response.data.pools)
    }
}

export default PoolsService;
