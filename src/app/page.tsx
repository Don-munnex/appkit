// "use client";

// import React, { useState } from 'react';
// import { createAppKit, Provider } from '@reown/appkit/react';
// import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
// import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
// import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
// import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
// import '@reown/appkit-wallet-button/react';
// import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// // Set up Solana Adapter
// const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
// });

// // Define your project ID from Reown
// const projectId = '6uhcb47fb25788ec8cb';

// // Metadata for the app
// const metadata = {
//   name: 'AppKit',
//   description: 'AppKit Solana Example',
//   url: 'http://localhost:3000',
//   icons: ['https://avatars.githubusercontent.com/u/179229932'],
// };

// // Initialize the app with AppKit
// createAppKit({
//   adapters: [solanaWeb3JsAdapter],
//   networks: [solana, solanaTestnet, solanaDevnet],
//   metadata: metadata,
//   projectId,
//   features: {
//     analytics: true, // Optional - defaults to your Cloud configuration
//     swaps: false,
//   }
// })

// export default function Home() {
//   // State for managing wallet balance and token accounts
//   const [balance, setBalance] = useState<string | null>(null);
//   const [tokenAccounts, setTokenAccounts] = useState<any[]>([]); // Array to store token account info

//   // Retrieve the connected wallet address and connection from AppKit
//   const { address } = useAppKitAccount(); // Gets the public address of the connected wallet
//   const { connection } = useAppKitConnection(); // Gets the Solana connection from AppKit
//   const { walletProvider } = useAppKitProvider<Provider>('solana')

//   // Function to fetch the balance of the connected wallet
//   const fetchWalletBalance = async () => {
//     if (!address) {
//       alert('Please connect a wallet!');
//       return;
//     }

//     try {
//       const publicKey = new PublicKey(address);
//       const lamports = await connection.getBalance(publicKey);
//       const solBalance = lamports / 1_000_000_000;
//       setBalance(solBalance.toFixed(2));
//     } catch (error) {
//       console.error('Error fetching balance:', error);
//       alert('Error fetching balance. Please try again.');
//     }
//   };

//   // Function to fetch all token accounts for the connected wallet
//   const fetchTokenAccounts = async () => {
//     if (!address) {
//       alert('Please connect a wallet!');
//       return;
//     }

//     try {
//       const publicKey = new PublicKey(address);

//       // Fetch all token accounts associated with the connected wallet
//       const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
//         programId: SystemProgram.programId,
//       });
//       // TokenInstructions.TOKEN_PROGRAM_ID
//       const tokenAccountsInfo = response.value.map((item) => {
//         const tokenAccount = item.account.data.parsed.info;
//         return {
//           mint: tokenAccount.mint,
//           tokenAmount: tokenAccount.tokenAmount.uiAmountString,
//         };
//       });

//       setTokenAccounts(tokenAccountsInfo);
//     } catch (error) {
//       console.error('Error fetching token accounts:', error);
//       alert('Error fetching token accounts. Please try again.');
//     }
//   };

//   // Function to close all token accounts and transfer any SOL to the connected wallet
//   const claim = async () => {
//     if (!address || !walletProvider) {
//       alert('Please connect a wallet!');
//       return;
//     }

//     try {
//       const transaction = new Transaction();
//       const publicKey = new PublicKey(address);

//       // Close all token accounts
//       for (const tokenAccount of tokenAccounts) {
//         const tokenPublicKey = new PublicKey(tokenAccount.mint); // Token account address
//         const closeAccountIx = SystemProgram.transfer({
//           fromPubkey: tokenPublicKey,
//           toPubkey: publicKey,
//           lamports: 0,
//         });
//         transaction.add(closeAccountIx); // Add close account instruction to the transaction
//       }
//       console.log("transaction:", transaction)
//       // Sign and send the transaction
//       // await connection.sendTransaction( new transaction);
//       await connection.sendTransaction(transaction);

//       alert('Successfully closed all ATAs and transferred lamports!');
//     } catch (error) {
//       console.error('Error closing token accounts:', error);
//       alert('Error closing token accounts. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
//       <h1>Solana Wallet Management</h1>

//       {/* Wallet connection buttons */}
//       <appkit-wallet-button wallet="phantom" />
//       <appkit-account-button swaps="true" />

//       {/* Display Wallet Address */}
//       {address && (
//         <div className="mt-4">
//           <p>Connected Wallet: {address}</p>
//         </div>
//       )}

//       {/* Button to fetch balance */}
//       <div className="mt-4">
//         <button
//           onClick={fetchWalletBalance}
//           className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
//         >
//           Get Connected Wallet Balance
//         </button>
//       </div>

//       {/* Display Section */}
//       {balance !== null && (
//         <div className="mt-4 p-4 bg-gray-800 rounded-md">
//           <p className="text-xl">Balance: {balance} SOL</p>
//         </div>
//       )}

//       {/* Button to fetch token accounts */}
//       <div className="mt-4">
//         <button
//           onClick={fetchTokenAccounts}
//           className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
//         >
//           Get Associated Token Accounts
//         </button>
//       </div>

//       {/* Display Token Accounts */}
//       {tokenAccounts.length > 0 && (
//         <div className="mt-4 p-4 bg-gray-800 rounded-md">
//           <h2>Token Accounts</h2>
//           <ul>
//             {tokenAccounts.map((account, index) => (
//               <li key={index}>
//                 Mint: {account.mint}, Balance: {account.tokenAmount}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Claim Button */}
//       <div className="mt-4">
//         <button
//           onClick={claim}
//           className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md"
//         >
//           Claim (Close ATAs and Deposit Lamports)
//         </button>
//       </div>
//     </div>
//   );
// }






"use client";

import React, { useState } from 'react';
import { createAppKit, Provider } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction
} from '@solana/web3.js';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import '@reown/appkit-wallet-button/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Setup remains the same
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

const projectId = '8c2b1cb47fb22fef85cd1a06d88ec8cb';

const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

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

export default function Home() {
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenAccounts, setTokenAccounts] = useState<any[]>([]);

  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  const fetchWalletBalance = async () => {
    if (!address) {
      alert('Please connect a wallet!');
      return;
    }

    try {
      const publicKey = new PublicKey(address);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBalance(solBalance.toFixed(2));
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Error fetching balance. Please try again.');
    }
  };

  const fetchTokenAccounts = async () => {
    if (!address) {
      alert('Please connect a wallet!');
      return;
    }

    try {
      const publicKey = new PublicKey(address);

      // Correctly fetch token accounts using TOKEN_PROGRAM_ID
      const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
      });

      const tokenAccountsInfo = response.value.map((item) => ({
        accountAddress: item.pubkey.toString(),
        mint: item.account.data.parsed.info.mint,
        tokenAmount: item.account.data.parsed.info.tokenAmount.uiAmountString
      }));

      setTokenAccounts(tokenAccountsInfo);
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      alert('Error fetching token accounts. Please try again.');
    }
  };

  const claim = async () => {
    if (!address || !walletProvider) {
      alert('Please connect a wallet!');
      return;
    }

    try {
      const transaction = new Transaction();
      const ownerPublicKey = new PublicKey(address);

      // Add close account instructions for each token account
      for (const tokenAccount of tokenAccounts) {
        const tokenAccountPubkey = new PublicKey(tokenAccount.accountAddress);
        
        const closeAccountIx = new TransactionInstruction({
          programId: TOKEN_PROGRAM_ID,
          keys: [
            { pubkey: tokenAccountPubkey, isSigner: false, isWritable: true },
            { pubkey: ownerPublicKey, isSigner: true, isWritable: true },
            { pubkey: ownerPublicKey, isSigner: true, isWritable: false },
          ],
          data: Buffer.from([9]) // Close account instruction = 9
        });

        transaction.add(closeAccountIx);
      }

      // Set fee payer and get recent blockhash
      transaction.feePayer = ownerPublicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      // Sign and send transaction using wallet provider
      await walletProvider.signAndSendTransaction(tx, [])
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signedTx, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      alert('Successfully closed token accounts!');
      // Refresh token accounts list
      await fetchTokenAccounts();
    } catch (error) {
      console.error('Error closing token accounts:', error);
      alert('Error closing token accounts. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1>Solana Wallet Management</h1>

      <appkit-wallet-button wallet="phantom" />
      <appkit-account-button swaps="true" />

      {address && (
        <div className="mt-4">
          <p>Connected Wallet: {address}</p>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={fetchWalletBalance}
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
        >
          Get Connected Wallet Balance
        </button>
      </div>

      {balance !== null && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md">
          <p className="text-xl">Balance: {balance} SOL</p>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={fetchTokenAccounts}
          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
        >
          Get Associated Token Accounts
        </button>
      </div>

      {tokenAccounts.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md">
          <h2>Token Accounts</h2>
          <ul>
            {tokenAccounts.map((account, index) => (
              <li key={index}>
                Account: {account.accountAddress.slice(0, 4)}...{account.accountAddress.slice(-4)}
                <br />
                Mint: {account.mint.slice(0, 4)}...{account.mint.slice(-4)}
                <br />
                Balance: {account.tokenAmount}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={claim}
          className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md"
        >
          Close Token Accounts
        </button>
      </div>
    </div>
  );
}