# RSA SDK JS Usage Guide

The JavaScript SDK allows you to interact with the RSA CRYPTO token (code: RSA) on the RSA Chain from your web or Node.js applications.

## Installation
```sh
npm install rsa-sdk-js
```

## Initialization
```js
const RSA = require('rsa-sdk-js');
const sdk = new RSA({
  nodeUrl: process.env.NODE_URL,
  horizonUrl: process.env.HORIZON_URL
});
```

## Example: Get Account Info
```js
sdk.accounts.get('G...').then(account => {
  console.log(account);
});
```

## Example: Send Payment
```js
sdk.payments.send({
  from: 'G...',
  to: 'G...',
  amount: '10',
  asset: 'RSA', // RSA CRYPTO
  secret: 'S...'
}).then(result => {
  console.log(result);
});
```

## More
See the [API reference](./api.md) for available methods and options. 