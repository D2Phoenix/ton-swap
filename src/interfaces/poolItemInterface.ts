export default interface PoolItemInterface {
    id: string;
    feeTier: string;
    token0: {
        decimals: string;
        derivedETH: string;
        id: string;
        name: string;
        symbol: string;
    },
    token0Price: string;
    token1: {
        decimals: string;
        derivedETH: string;
        id: string;
        name: string;
        symbol: string;
    },
    token1Price: string;
    totalValueLockedToken0: string;
    totalValueLockedToken1: string;
    totalValueLockedUSD: string;
    volumeUSD: string;
    volume24USD: string;
    volume7dUSD: string;
    volume24Change: string;
    totalValueLockedChange: string;
}
