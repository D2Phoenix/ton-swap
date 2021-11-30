# TONSwap

Demo available at: [https://ton-swap-22qkz.ondigitalocean.app](https://ton-swap-22qkz.ondigitalocean.app)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Install and start locally

```shell
yarn install
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploy with Docker

```shell
yarn docker:build
yarn docker:run
```

Open [http://localhost:1337](http://localhost:1337) to view it in the browser.

## Implemented Pages and Features

- Swap page for exchanging one token for another token
- Pool page for creating a pool with two tokens and manage existing user pools
- Add and Remove Liquidity pages
- Import Pool Page
- Top Pools page with a list of pools and pool statistics
- Wallet Account Modal with a list of latest translations
- Notifications for pending transactions
- Charts with [recharts](https://github.com/recharts/recharts)
- Math with [bignumber.js](https://github.com/MikeMcl/bignumber.js/)
- Internationalization support with [react-i18n](https://github.com/i18next/react-i18next)
- Progressive Web App support
- Lazy loading of pages
- Mobile friendly

*Notice* For demo purpose [simple-uniswap-sdk](https://github.com/uniswap-integration/simple-uniswap-sdk) was used to mock exchange rates

## Further work

- Implement Token List Manage
- Unit and e2e tests

## App Screens

[Here](/docs/images)

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn test`

Launches the test runner in the interactive watch mode.\

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn docker:build`

Builds the Docker image in the production mode.

### `yarn docker:run`

Create docker container in the production mode.
Open [http://localhost:1337](http://localhost:1337) to view it in the browser.

### `yarn docker:build:dev`

Builds the Docker image in the development mode.

### `yarn docker:run:dev`

Create docker container in the development mode.
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `yarn i18n`

Extract translations to 'src/i18n' folder

### `yarn analyze`

Analyze bundle size. Build app first (yarn build)
