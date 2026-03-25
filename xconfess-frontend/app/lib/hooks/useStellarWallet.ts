"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isFreighterAvailable,
  getPublicKey,
  anchorConfession,
  hashConfession,
} from "@/app/lib/utils/stellar";

export interface StellarWalletState {
  isAvailable: boolean;
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  readinessError: string | null;
}

export function useStellarWallet() {
  const [state, setState] = useState<StellarWalletState>({
    isAvailable: false,
    isConnected: false,
    publicKey: null,
    network: null,
    isLoading: true,
    error: null,
    isReady: false,
    readinessError: null,
  });

  const updateReadiness = (
    currentState: Partial<StellarWalletState>,
  ): Partial<StellarWalletState> => {
    if (!currentState.isConnected) {
      return { isReady: false, readinessError: null };
    }

    const expected = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
    const actual = (currentState.network || "").toUpperCase();

    let isNetworkMatch = false;
    if (expected === "mainnet") {
      isNetworkMatch = ["PUBLIC", "PUBLIC_NETWORK", "MAINNET"].includes(actual);
    } else {
      isNetworkMatch = ["TESTNET", "TESTNET_SOROBAN"].includes(actual);
    }

    if (!isNetworkMatch) {
      const displayExpected = expected === "mainnet" ? "Mainnet" : "Testnet";
      return {
        isReady: false,
        readinessError: `Wallet on wrong network. Please switch to ${displayExpected}.`,
      };
    }

    if (!currentState.publicKey) {
      return {
        isReady: false,
        readinessError:
          "Wallet signer is unavailable. Unlock Freighter and try again.",
      };
    }

    return { isReady: true, readinessError: null };
  };

  useEffect(() => {
    const checkWallet = async () => {
      const available = await isFreighterAvailable();
      setState((prev) => ({
        ...prev,
        isAvailable: available,
        isLoading: false,
      }));
    };

    checkWallet();
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const available = await isFreighterAvailable();
      if (!available) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            "Freighter wallet not found. Please install Freighter extension.",
        }));
        return;
      }

      const publicKey = await getPublicKey();
      if (!publicKey) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to connect wallet. Please check Freighter.",
        }));
        return;
      }

      let networkStr = "TESTNET_SOROBAN";
      if (
        (window as any).freighter &&
        typeof (window as any).freighter.getNetwork === "function"
      ) {
        networkStr = await (window as any).freighter.getNetwork();
      }

      setState((prev) => {
        const nextState = {
          ...prev,
          isConnected: true,
          publicKey,
          network: networkStr,
          isLoading: false,
          error: null,
        };
        const readiness = updateReadiness(nextState);
        return { ...nextState, ...readiness } as StellarWalletState;
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to connect wallet",
      }));
    }
  }, []);

  const anchor = useCallback(
    async (
      content: string,
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (!state.isConnected || !state.publicKey) {
        setState((prev) => ({
          ...prev,
          error: "Wallet not connected",
        }));
        return {
          success: false,
          error: "Wallet not connected",
        };
      }

      if (!state.isReady) {
        const err = state.readinessError || "Wallet not ready";
        setState((prev) => ({
          ...prev,
          error: err,
        }));
        return {
          success: false,
          error: err,
        };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const timestamp = Date.now();
        const hash = hashConfession(content, timestamp);
        const result = await anchorConfession(hash, timestamp);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || null,
        }));

        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Failed to anchor confession";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [state.isConnected, state.publicKey, state.isReady, state.readinessError],
  );

  return {
    ...state,
    connect,
    anchor,
  };
}
