# RSA Horizon API Reference (RSA CRYPTO, code: RSA)

The Horizon API provides a RESTful interface to interact with the RSA Chain blockchain.

## Base URL
```
https://horizon.rsacrypto.com
```

## Endpoints

### Get Account
```
GET /accounts/{account_id}
```
Returns account details.

### List Transactions
```
GET /transactions?limit=10&order=desc
```
Returns a list of recent transactions.

### Submit Transaction
```
POST /transactions
Body: { "tx": "<base64-encoded-transaction>" }
```
Submits a signed transaction to the network.

### Get Ledger
```
GET /ledgers/{sequence}
```
Returns details for a specific ledger.

## More
See the [online docs](https://docs.rsacrypto.com) for a full API reference. 