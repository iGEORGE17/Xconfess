/**
 * Tipping Service
 * Handles XLM tipping functionality for confessions
 */

import * as StellarSDK from '@stellar/stellar-sdk';

const MIN_TIP_AMOUNT = 0.1; // Minimum tip in XLM

export interface TipStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

export interface Tip {
  id: string;
  confessionId: string;
  amount: number;
  txId: string;
  senderAddress: string | null;
  createdAt: string;
}

/**
 * Get Stellar network configuration
 */
function getStellarNetwork(): StellarSDK.Networks {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
  return network === 'mainnet'
    ? StellarSDK.Networks.PUBLIC
    : StellarSDK.Networks.TESTNET;
}

/**
 * Get Stellar Horizon server
 */
function getStellarServer(): StellarSDK.Horizon.Server {
  const horizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
    'https://horizon-testnet.stellar.org';
  return new StellarSDK.Horizon.Server(horizonUrl);
}

/**
 * Check if Freighter wallet is available
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const freighter = (window as any).freighterApi;
    return !!freighter;
  } catch {
    return false;
  }
}

/**
 * Send a tip to a confession
 * @param confessionId - The ID of the confession to tip
 * @param amount - The amount in XLM to tip (minimum 0.1)
 * @param recipientAddress - The Stellar address of the confession creator
 * @returns Transaction hash if successful
 */
export async function sendTip(
  confessionId: string,
  amount: number,
  recipientAddress: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Validate minimum tip amount
    if (amount < MIN_TIP_AMOUNT) {
      return {
        success: false,
        error: `Minimum tip amount is ${MIN_TIP_AMOUNT} XLM`,
      };
    }

    // Check if Freighter is available
    const freighter = (window as any).freighterApi;
    if (!freighter) {
      return {
        success: false,
        error: 'Freighter wallet not found. Please install Freighter extension.',
      };
    }

    // Get public key from wallet
    const publicKey = await freighter.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: 'Failed to get public key from wallet',
      };
    }

    const network = getStellarNetwork();
    const server = getStellarServer();

    // Load sender account
    const senderAccount = await server.loadAccount(publicKey);

    // Validate recipient address format
    try {
      StellarSDK.Keypair.fromPublicKey(recipientAddress);
    } catch {
      return {
        success: false,
        error: 'Invalid recipient address',
      };
    }

    // Build payment transaction
    const transactionBuilder = new StellarSDK.TransactionBuilder(senderAccount, {
      fee: StellarSDK.BASE_FEE,
      networkPassphrase: network,
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: recipientAddress,
          asset: StellarSDK.Asset.native(),
          amount: amount.toString(),
        }),
      )
      .setTimeout(30);

    // Optional: Add memo with confession ID for tracking
    // Remove this line for full anonymity (no link between tip and confession on-chain)
    // transactionBuilder.addMemo(StellarSDK.Memo.text(`tip:${confessionId}`));

    const transaction = transactionBuilder.build();

    // Sign transaction with Freighter
    const signedTx = await freighter.signTransaction(transaction.toXDR(), {
      network,
    });

    if (!signedTx) {
      return {
        success: false,
        error: 'Failed to sign transaction',
      };
    }

    // Submit transaction
    const tx = StellarSDK.TransactionBuilder.fromXDR(signedTx, network);
    const result = await server.submitTransaction(tx);

    if (!result.hash) {
      return {
        success: false,
        error: 'Transaction submitted but no hash returned',
      };
    }

    // Verify transaction was successful
    if (result.successful !== true) {
      return {
        success: false,
        error: 'Transaction failed on Stellar network',
      };
    }

    return {
      success: true,
      txHash: result.hash,
    };
  } catch (error: any) {
    console.error('Failed to send tip:', error);
    return {
      success: false,
      error: error.message || 'Failed to send tip',
    };
  }
}

/**
 * Get tips for a confession
 */
export async function getTips(confessionId: string): Promise<Tip[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/confessions/${confessionId}/tips`);

    if (!response.ok) {
      throw new Error('Failed to fetch tips');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get tips:', error);
    return [];
  }
}

/**
 * Get tip statistics for a confession
 */
export async function getTipStats(confessionId: string): Promise<TipStats | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(
      `${apiUrl}/confessions/${confessionId}/tips/stats`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tip stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get tip stats:', error);
    return null;
  }
}

/**
 * Verify and record a tip transaction
 */
export async function verifyTip(
  confessionId: string,
  txHash: string,
): Promise<{ success: boolean; tip?: Tip; error?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(
      `${apiUrl}/confessions/${confessionId}/tips/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txId: txHash }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to verify tip');
    }

    const tip = await response.json();
    return {
      success: true,
      tip,
    };
  } catch (error: any) {
    console.error('Failed to verify tip:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify tip',
    };
  }
}
