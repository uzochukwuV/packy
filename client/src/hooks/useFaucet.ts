/**
 * Hook for interacting with LEAGUE token faucet
 */

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface FaucetResponse {
  success: boolean;
  txHash?: string;
  amount?: string;
  error?: string;
  nextRequestTime?: number;
}

export function useFaucet() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const requestTokens = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastTxHash(null);

    try {
      const response = await fetch('/api/faucet/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data: FaucetResponse = await response.json();

      if (data.success) {
        setLastTxHash(data.txHash || null);
        return data;
      } else {
        setError(data.error || 'Failed to request tokens');
        throw new Error(data.error || 'Failed to request tokens');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestTokens,
    isLoading,
    error,
    lastTxHash,
  };
}
