"use client";

import React, { useState } from 'react';
// Import necessary libraries
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { Connection, PublicKey } from '@solana/web3.js' // Import necessary Solana libraries
import '@reown/appkit-wallet-button/react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'

// Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// Define your project ID from Reown
const projectId = '8c2b1cb47fb22fef85cd1a06d88ec8cb'

// Metadata for the app
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// Initialize the app with AppKit
createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    swaps: false,
  }
})

export default function Home() {
  // State for managing wallet balance
  const [balance, setBalance] = React.useState<string | null>(null);

  // Retrieve the connected wallet address and connection from AppKit
  const { address } = useAppKitAccount(); // Gets the public address of the connected wallet
  const { connection } = useAppKitConnection(); // Gets the Solana connection from AppKit

  // Function to fetch the balance of the connected wallet
  const fetchWalletBalance = async () => {
    if (!address) {
      alert('Please connect a wallet!');
      return;
    }

    try {
      // Create a PublicKey object from the connected wallet address
      const publicKey = new PublicKey(address);

      // Get the balance of the connected wallet (in Lamports)
      const lamports = await connection.getBalance(publicKey);

      // Convert Lamports to SOL (1 SOL = 1,000,000,000 Lamports)
      const solBalance = lamports / 1_000_000_000;

      // Set the balance state to display
      setBalance(solBalance.toFixed(2));
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Error fetching balance. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1>Solana Wallet Balance</h1>

      {/* Wallet connection buttons */}
      <appkit-wallet-button wallet="phantom" />
      <appkit-account-button swaps="true" />

      {/* Display Wallet Address */}
      {address && (
        <div className="mt-4">
          <p>Connected Wallet: {address}</p>
        </div>
      )}

      {/* Button to fetch balance */}
      <div className="mt-4">
        <button
          onClick={fetchWalletBalance}
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
        >
          Get Connected Wallet Balance
        </button>
      </div>

      {/* Display Section */}
      {balance !== null && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md">
          <p className="text-xl">Balance: {balance} SOL</p>
        </div>
      )}
    </div>
  );
}
