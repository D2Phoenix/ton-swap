import PoolListInterface from 'interfaces/poolListInterface';

export function getPools(): Promise<PoolListInterface[]> {
    return Promise.resolve([{
        name: 'TON/AAVE',
        address: '1',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png',
        total7d: '300.05',
        totalVolume: '200.43',
        total24: '100.34',
    },{
        name: 'TON/ADAB',
        address: '2',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x034b0dd380b5f6f8123b8d0d0e42329b67772792',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4468.png',
        total7d: '200.45',
        totalVolume: '100.32',
        total24: '50.23',
    },{
        name: 'TON/DOGEBEAR',
        address: '3',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0xF1d32952E2fbB1a91e620b0FD7fBC8a8879A47f3',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6097.png',
        total7d: '200.00',
        totalVolume: '100.00',
        total24: '50.00',
    },{
        name: 'TON/SHIB',
        address: '4',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png',
        total7d: '500.00',
        totalVolume: '300.00',
        total24: '150.00',
    },{
        name: 'TON/UNI',
        address: '5',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png',
        total7d: '445.00',
        totalVolume: '343.00',
        total24: '34.00',
    },{
        name: 'TON/LINK',
        address: '6',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
        total7d: '555.00',
        totalVolume: '888.00',
        total24: '100.00',
    },{
        name: 'TON/MANA',
        address: '7',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png',
        total7d: '20.00',
        totalVolume: '8.00',
        total24: '1.00',
    },{
        name: 'TON/USDC',
        address: '8',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
        total7d: '445.00',
        totalVolume: '343.00',
        total24: '34.00',
    },{
        name: 'TON/DOTX',
        address: '9',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0xFAb5a05C933f1A2463E334E011992E897D56eF0a',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6796.png',
        total7d: '234.00',
        totalVolume: '409.00',
        total24: '23.00',
    },{
        name: 'TON/SOL',
        address: '10',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0x1f54638b7737193ffd86c19ec51907a7c41755d8',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3333.png',
        total7d: '34.00',
        totalVolume: '90.00',
        total24: '20.00',
    },{
        name: 'TON/USDT',
        address: '11',
        tokenOneAddress: '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
        tokenTwoAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
        total7d: '445.00',
        totalVolume: '343.00',
        total24: '34.00',
    },{
        name: 'AAVE/ADAB',
        address: '12',
        tokenOneAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        tokenTwoAddress: '0x034b0dd380b5f6f8123b8d0d0e42329b67772792',
        logoOneURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png',
        logoTwoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4468.png',
        total7d: '456.00',
        totalVolume: '435.00',
        total24: '44.00',
    }]);
}