import * as StellarSDK from "@stellar/stellar-sdk";
import CryptoJS from "crypto-js";

/**
 * Hash confession content for anchoring on Stellar
 * Returns a 32-byte hash as hex string
 */
export function hashConfession(content: string, timestamp?: number): string {
  const data = content + (timestamp || Date.now());
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

/**
 * Get Stellar network configuration
 */
export function getStellarNetwork(): StellarSDK.Networks {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
  return network === "mainnet"
    ? StellarSDK.Networks.PUBLIC
    : StellarSDK.Networks.TESTNET;
}

/**
 * Get Stellar server instance
 */
export function getStellarServer(): StellarSDK.Horizon.Server {
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
    "https://horizon-testnet.stellar.org";
  return new StellarSDK.Horizon.Server(horizonUrl);
}

/**
 * Check if Freighter wallet is available
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    // Check for Freighter extension
    const freighter = (window as any).freighterApi;
    return !!freighter;
  } catch {
    return false;
  }
}

/**
 * Get public key from Freighter wallet
 */
export async function getPublicKey(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const freighter = (window as any).freighterApi;
    if (!freighter) return null;

    const publicKey = await freighter.getPublicKey();
    return publicKey || null;
  } catch (error) {
    console.error("Failed to get public key:", error);
    return null;
  }
}

/**
 * Anchor confession on Stellar using Soroban contract
 */
export async function anchorConfession(
  confessionHash: string,
  timestamp: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contractId = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID;
    if (!contractId) {
      return {
        success: false,
        error: "Stellar contract ID not configured",
      };
    }

    const freighter = (window as any).freighterApi;
    if (!freighter) {
      return {
        success: false,
        error: "Freighter wallet not found",
      };
    }

    const publicKey = await freighter.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: "Failed to get public key from wallet",
      };
    }

    const network = getStellarNetwork();
    const server = getStellarServer();

    // Get account
    const account = await server.loadAccount(publicKey);

    // Create contract instance
    const contract = new StellarSDK.Contract(contractId);

    // Prepare contract call
    // Convert hex string to Buffer (32 bytes for SHA-256)
    const hashBuffer = Buffer.from(confessionHash, "hex");
    if (hashBuffer.length !== 32) {
      throw new Error("Invalid hash length");
    }
    
    // Create ScVal for hash bytes (BytesN<32>)
    // Convert Buffer to Uint8Array for ScBytes
    const hashArray = new Uint8Array(hashBuffer);
    const hashBytes = StellarSDK.xdr.ScVal.scvBytes(
      StellarSDK.xdr.ScBytes.fromXDR(hashArray)
    );
    
    // Create ScVal for timestamp (u64)
    const timestampVal = StellarSDK.xdr.ScVal.scvU64(
      StellarSDK.xdr.UInt64.fromString(timestamp.toString())
    );

    // Build transaction with contract invocation
    // Note: Contract.call() API may vary by SDK version - adjust if needed
    const transaction = new StellarSDK.TransactionBuilder(account, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: network,
    })
      .addOperation(
        contract.call("anchor_confession", hashBytes, timestampVal)
      )
      .setTimeout(30)
      .build();

    // Sign transaction with Freighter
    const signedTx = await freighter.signTransaction(
      transaction.toXDR(),
      network
    );

    // Submit transaction
    const txResponse = await server.submitTransaction(
      StellarSDK.TransactionBuilder.fromXDR(signedTx, network)
    );

    return {
      success: true,
      txHash: txResponse.hash,
    };
  } catch (error: any) {
    console.error("Failed to anchor confession:", error);
    return {
      success: false,
      error: error.message || "Failed to anchor confession on Stellar",
    };
  }
}
