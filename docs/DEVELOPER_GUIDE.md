# Developer Guide

Welcome to the RSA Chain developer guide! This document will help you get started with contributing to and extending the project.

## Project Structure
- `rsa-core/`: Core blockchain protocol (C++) for RSA CRYPTO (code: RSA)
- `rsa-horizon/`: API server (Go)
- `rsa-sdk-js/`: JavaScript SDK
- `rsa-wallet-web/`: Web wallet frontend (React) for RSA CRYPTO
- `rsa-explorer/`: Blockchain explorer (React) for RSA CRYPTO
- `rsa-faucet/`: Testnet faucet (Node.js) for RSA CRYPTO
- `docs/`: Documentation

## Setting Up Your Environment
- Follow the [installation guide](./installation.md).
- Use the provided `.env.example` for environment variables.

## Development Tips
- Each subproject has its own dependencies and build steps.
- Use feature branches for new work.
- Write clear commit messages and open pull requests for review.

## Testing
- Add and run tests in each subproject as appropriate.
- Use CI to ensure code quality.

## Questions?
- Open an issue or discussion on GitHub.

Happy building! 