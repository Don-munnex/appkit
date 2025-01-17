"use client";

import React, { useState } from 'react';
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { Connection, PublicKey, GetProgramAccountsFilter } from '@solana/web3.js'
import '@reown/appkit-wallet-button/react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Types
interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface ParsedAccountInfo {
  mint: string;
  owner: string;
  tokenAmount: TokenAmount;
  delegate: string | null;
  state: string;
  isNative: boolean;
}

interface ParsedAccount {
  program: string;
  parsed: {
    info: ParsedAccountInfo;
    type: string;
  };
  space: number;
}

interface TokenAccount {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
}

// Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
});

// Define your project ID from Reown
const projectId = '8c2b1cb47fb22fef85cd1a06d88ec8cb';

// Metadata for the app
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Initialize the app with AppKit
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true,
    swaps: false,
  }
});

// Utility function to format token amounts
const formatAmount = (amount: string, decimals: number): string => {
  const value = parseInt(amount) / Math.pow(10, decimals);
  return value.toLocaleString(undefined, { 
    maximumFractionDigits: decimals 
  });
};

export default function Home() {
  const [solanaAddress, setSolanaAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const connection = new Connection('https://api.devnet.solana.com');
  // const { connection } = useAppKitConnection();

  const fetchBalance = async () => {
    if (!solanaAddress) {
      alert('Please enter a Solana address!');
      return;
    }

    try {
      const publicKey = new PublicKey(solanaAddress);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / 1_000_000_000;
      setBalance(solBalance.toFixed(2));
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Error fetching balance. Please check the address and try again.');
    }
  };
 
  const getAssociatedTokenAccounts = async () => {
    if (!solanaAddress) {
      alert('Please enter a Solana address!');
      return;
    }

    setIsLoading(true);
    try {
      const publicKey = new PublicKey(solanaAddress);

      const filters: GetProgramAccountsFilter[] = [
        { dataSize: 165 },
        {
          memcmp: {
            offset: 32,
            bytes: publicKey.toBase58()
          }
        }
      ];
     
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        { filters }
      );
  
      const tokenAccountsData: TokenAccount[] = accounts.map(account => {
        const parsedData = (account.account.data as ParsedAccount).parsed.info;
        
        return {
          mint: parsedData.mint,
          amount: parsedData.tokenAmount.amount,
          decimals: parsedData.tokenAmount.decimals,
          uiAmount: parsedData.tokenAmount.uiAmount,
          symbol: '',
          name: ''
        };
      });
      console.log("tokenAccountsData:", tokenAccountsData)

      // Fetch token metadata for each account
      const accountsWithMetadata = await Promise.all(
        tokenAccountsData.map(async (account) => {
          try {
            const response = await fetch(`https://public-api.solscan.io/token/meta/${account.mint}`);
            const metadata = await response.json();
            
            return {
              ...account,
              symbol: metadata.symbol || 'Unknown',
              name: metadata.name || 'Unknown Token'
            };
          } catch (error) {
            return account;
          }
        })
      );
      console.log("accWithMetadata:", accountsWithMetadata);

      // Filter out accounts with zero balance
      // const nonZeroAccounts = accountsWithMetadata.filter(
      //   account => parseFloat(account.amount) > 0
      // );

      // setTokenAccounts(nonZeroAccounts);
      // console.log("Token accounts found:", nonZeroAccounts);
    } catch (error) {
      console.error('Error getting associated token accounts:', error);
      alert('Error getting associated token accounts. Please check the address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-6">Solana Token Account Explorer</h1>

      <appkit-wallet-button wallet="phantom" />
      <appkit-network-button network="solana" />
      <appkit-account-button swaps="true" />

      <div className="mt-6 w-full max-w-xl">
        <input
          type="text"
          className="w-full bg-gray-700 text-white p-3 rounded-md"
          placeholder="Enter Solana address"
          value={solanaAddress}
          onChange={(e) => setSolanaAddress(e.target.value)}
        />
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={fetchBalance}
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-md"
          >
            Get Balance
          </button>
          <button
            onClick={getAssociatedTokenAccounts}
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Get Token Accounts'}
          </button>
        </div>
      </div>

      {balance !== null && (
        <div className="mt-6 p-4 bg-gray-800 rounded-md w-full max-w-xl">
          <p className="text-xl">Balance: {balance} SOL</p>
        </div>
      )}

      {tokenAccounts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800 rounded-md w-full max-w-xl">
          <h2 className="text-xl mb-4">Token Accounts</h2>
          <div className="space-y-4">
            {tokenAccounts.map((account, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded-md">
                <p className="font-semibold">
                  {account.name || account.symbol || 'Unknown Token'}
                </p>
                <p className="text-gray-300">
                  Mint: {account.mint.slice(0, 4)}...{account.mint.slice(-4)}
                </p>
                <p className="text-gray-300">
                  Balance: {formatAmount(account.amount, account.decimals)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}