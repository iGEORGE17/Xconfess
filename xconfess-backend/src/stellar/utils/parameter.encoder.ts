// src/stellar/utils/parameter.encoder.ts
// Utility for encoding/decoding contract parameters (Soroban)
// NOTE: This is a placeholder, real encoding logic is in contract.service.ts

import * as StellarSDK from '@stellar/stellar-sdk';

export function encodeStringParam(val: string) {
  return StellarSDK.nativeToScVal(val, { type: 'string' });
}

export function encodeU64Param(val: number) {
  return StellarSDK.nativeToScVal(val, { type: 'u64' });
}

export function encodeBytesParam(val: Buffer | string) {
  return StellarSDK.nativeToScVal(val, { type: 'bytes' });
}
