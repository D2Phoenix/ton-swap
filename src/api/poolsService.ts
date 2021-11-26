import PoolListInterface from 'interfaces/poolListInterface';
import BigNumber from 'bignumber.js';

class PoolsService {
    getPools(): Promise<PoolListInterface[]> {
        return Promise.all([
            this.getPoolByDate('pools.json'),
            this.getPoolByDate('pools24.json'),
            this.getPoolByDate('pools48.json'),
            this.getPoolByDate('pools7d.json')
        ]).then(([pools, pools24, pools48, pools7d]) => {
            return pools.map((pool: PoolListInterface, index: number) => {
                const pool24 = pools24.find((item: PoolListInterface) => item.id === pool.id);
                const pool7d = pools7d.find((item: PoolListInterface) => item.id === pool.id);
                return {
                    ...pool,
                    volume24USD: new BigNumber(pool.volumeUSD).minus(pool24.volumeUSD).toString(),
                    volume7dUSD: new BigNumber(pool.volumeUSD).minus(pool7d.volumeUSD).toString(),
                }
            });
        })
    }
    private getPoolByDate(name: string) {
        return fetch(`/data/${name}`)
            .then((response) => response.json())
            .then(response => response.data.pools)
    }
}

export default PoolsService;
