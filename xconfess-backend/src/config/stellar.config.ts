// src/config/stellar.config.ts
// Loads Stellar config from environment for NestJS ConfigModule

export default () => ({
  STELLAR_NETWORK: process.env.STELLAR_NETWORK || 'testnet',
  STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  STELLAR_SOROBAN_RPC_URL: process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-rpc-testnet.stellar.org',
  CONFESSION_ANCHOR_CONTRACT_ID: process.env.CONFESSION_ANCHOR_CONTRACT_ID,
  REPUTATION_BADGES_CONTRACT_ID: process.env.REPUTATION_BADGES_CONTRACT_ID,
  TIPPING_SYSTEM_CONTRACT_ID: process.env.TIPPING_SYSTEM_CONTRACT_ID,
  STELLAR_SERVER_SECRET: process.env.STELLAR_SERVER_SECRET,
});
