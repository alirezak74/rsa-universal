# RSA Core

This directory contains the core blockchain protocol for RSA Chain, forked from Stellar. It is responsible for consensus, transaction processing, and maintaining the distributed ledger for the RSA CRYPTO token (code: RSA).

## Features
- Federated Byzantine Agreement (FBA) consensus
- Fast, low-fee payments
- Multi-asset support
- On-chain token issuance

## Getting Started

### Build and Run (Standalone Node)

```sh
mkdir build && cd build
cmake ..
make -j4
./rsa-core --conf rsa.cfg
```

### Configuration
- Edit `rsa.cfg` to set network and node parameters.

## License
MIT

## Testing
Currently, there are no automated tests for rsa-core. Please refer to the main project documentation for updates or contribute tests if possible. 