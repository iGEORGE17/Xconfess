// src/stellar/utils/stellar-error.handler.ts
// Centralized error handler for Stellar/Soroban integration

export function handleStellarError(error: any): Error {
  if (error.response?.data?.extras?.result_codes) {
    const codes = error.response.data.extras.result_codes;
    return new Error(`Stellar error: ${JSON.stringify(codes)}`);
  }
  if (error.response?.data?.detail) {
    return new Error(`Stellar error: ${error.response.data.detail}`);
  }
  return new Error(`Stellar error: ${error.message || error}`);
}
