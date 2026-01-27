"use client";

import { useState, useEffect } from "react";
import { sendTip, verifyTip, getTipStats, type TipStats } from "@/lib/services/tipping.service";
import { useWallet } from "@/lib/hooks/useWallet";

interface TipButtonProps {
  confessionId: string;
  recipientAddress?: string; // Stellar address of confession creator
  initialStats?: TipStats;
}

export const TipButton = ({
  confessionId,
  recipientAddress,
  initialStats,
}: TipButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState<string>("0.1");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<TipStats | null>(initialStats || null);
  const { publicKey, isConnected, connect } = useWallet();

  // Fetch stats on mount and when confession changes
  useEffect(() => {
    const fetchStats = async () => {
      const tipStats = await getTipStats(confessionId);
      if (tipStats) {
        setStats(tipStats);
      }
    };
    fetchStats();
  }, [confessionId]);

  const handleTip = async () => {
    if (!recipientAddress) {
      setError("Recipient address not available. The confession creator needs to provide their Stellar address.");
      return;
    }

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount < 0.1) {
      setError("Minimum tip amount is 0.1 XLM");
      return;
    }

    if (!isConnected) {
      // Try to connect wallet
      try {
        await connect();
        // Wait a bit for connection
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        setError("Please connect your Freighter wallet to send tips");
        return;
      }
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Send tip transaction
      const result = await sendTip(confessionId, amount, recipientAddress);

      if (!result.success || !result.txHash) {
        throw new Error(result.error || "Failed to send tip");
      }

      // Verify and record tip on backend
      const verifyResult = await verifyTip(confessionId, result.txHash);

      if (!verifyResult.success) {
        throw new Error(
          verifyResult.error || "Tip sent but failed to verify on backend"
        );
      }

      setSuccess(true);
      setIsOpen(false);
      setTipAmount("0.1");

      // Refresh stats
      const updatedStats = await getTipStats(confessionId);
      if (updatedStats) {
        setStats(updatedStats);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send tip");
    } finally {
      setIsSending(false);
    }
  };

  const totalAmount = stats?.totalAmount || 0;
  const tipCount = stats?.totalCount || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!recipientAddress}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[44px] min-h-[44px] justify-center touch-manipulation"
        aria-label="Tip confession"
        title={!recipientAddress ? "Recipient address not available" : "Tip this confession"}
      >
        <span className="text-lg">💰</span>
        {tipCount > 0 && (
          <span className="text-sm font-medium">{tipCount}</span>
        )}
        {totalAmount > 0 && (
          <span className="text-xs opacity-75">
            {totalAmount.toFixed(1)} XLM
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-800 rounded-lg shadow-xl p-4 z-50 border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Send Tip</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {!isConnected && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded text-sm text-yellow-200">
              Please connect your Freighter wallet to send tips
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (XLM)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimum: 0.1 XLM
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/30 border border-green-700 rounded text-sm text-green-200">
                Tip sent successfully! 🎉
              </div>
            )}

            <button
              onClick={handleTip}
              disabled={isSending || !isConnected}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded font-medium text-white transition-all"
            >
              {isSending ? "Sending..." : `Send ${tipAmount} XLM Tip`}
            </button>

            {stats && (
              <div className="pt-3 border-t border-zinc-700 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Total Tips:</span>
                  <span className="text-white font-medium">
                    {totalAmount.toFixed(2)} XLM
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Tip Count:</span>
                  <span className="text-white font-medium">{tipCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
