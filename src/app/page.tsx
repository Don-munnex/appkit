"use client";

import React, { useState } from 'react';
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana, solanaTestnet, solanaDevnet, b3 } from '@reown/appkit/networks'
import { Connection, PublicKey, GetProgramAccountsFilter } from '@solana/web3.js'
import '@reown/appkit-wallet-button/react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';

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
  decimals: number;
  mint: string;
  amount: string;
  // decimals: number;
  // uiAmount: number;
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
  
  // const connection = new Connection('https://api.mainnet-beta.solana.com');
  // const { connection } = useAppKitConnection();
  const connection = new Connection('https://rpc.helius.xyz/?api-key=1691c2d7-842b-4cdb-8e73-ce38fb82acda');

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
      
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        publicKey,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
      
      console.log("Raw token accounts:", tokenAccounts);

      const tokenAccountsData: TokenAccount[] = tokenAccounts.value
        .map(account => {
          const accountData = AccountLayout.decode(account.account.data);
          // amount is u64, so it's already a BigInt
          const amount = accountData.amount.toString(); // Convert BigInt to string for storage/display
          const decimals = 9; // You might want to fetch this from the mint account
          
          return {
            mint: new PublicKey(accountData.mint).toString(),
            amount: amount,
            decimals: decimals,
            uiAmount: Number(amount) / Math.pow(10, decimals),
            symbol: '',
            name: ''
          };
        })
        .filter(account => Number(account.amount) > 0);

      console.log("Parsed token accounts:", tokenAccountsData);
      setTokenAccounts(tokenAccountsData);

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

























