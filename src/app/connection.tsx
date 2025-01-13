import * as React from 'react';
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, Adapter } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Custom ReownWalletAdapter implementation
class ReownWalletAdapter implements Adapter {
    name = 'Reown';
    url = 'https://reown.com';
    icon = 'https://reown.com/icon.png'; // Replace with actual Reown icon URL
    publicKey = null;
    connecting = false;
    connected = false;

    constructor() {
        // Initialize any required Reown wallet specific setup
    }

    async connect() {
        try {
            this.connecting = true;
            // Implement Reown wallet connection logic here
            // This would typically involve:
            // 1. Checking if Reown wallet is installed
            // 2. Requesting connection
            // 3. Setting up event listeners
            this.connected = true;
        } catch (error) {
            console.error('Error connecting to Reown wallet:', error);
            throw error;
        } finally {
            this.connecting = false;
        }
    }

    async disconnect() {
        // Implement disconnection logic
        this.connected = false;
    }

    async signTransaction(transaction: any) {
        // Implement transaction signing logic
        throw new Error('Method not implemented.');
    }

    async signAllTransactions(transactions: any[]) {
        // Implement batch transaction signing logic
        throw new Error('Method not implemented.');
    }
}

interface WalletContextProviderProps {
    children: ReactNode;
}

const WalletContext = createContext<WalletContextState | null>(null);

export const CustomWalletMultiButton = () => {
    const wallet = useSolanaWallet();
    const Buttontext = wallet.connected ? null : 'Connect';

    return (
        <div className="flex gap-4">
            <WalletMultiButton style={connectNavBarStyles}>
                {Buttontext}
            </WalletMultiButton>
            {!wallet.connected && (
                <button
                    onClick={() => wallet.select('Reown')}
                    style={connectNavBarStyles}
                >
                    Connect with Reown
                </button>
            )}
        </div>
    );
};

const connectNavBarStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '40px',
};

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new ReownWalletAdapter(),
    ], [network]);

    const wallet = useSolanaWallet();

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletContext.Provider value={wallet}>
                        {children}
                    </WalletContext.Provider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === null) {
        throw new Error('useWallet must be used within a WalletContextProvider');
    }
    return context;
};

export default WalletContextProvider;