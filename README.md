# Sui wallet with social login

This package is intended to provide a simple wrapper for social login with Sui wallet creation. This allows users to login once and immediately get a Sui wallet to be stored in a configured database. The intent is to ease user onboarding, allowing users to interact with your application and immediately start earning NFTs. They can then return later via social login and export their NFTs to an external wallet once they have that set up.

```
```

## Example usage

```javascript
```

## Testing

You need to run Sui locally in order for the tests to work. This will spin up a local Sui network, validators and faucet:

```
# Run this command in your local Sui repository directory
cargo run --bin sui-test-validator
```

Once the network is running, you can run the tests:

```
npm run test
```
