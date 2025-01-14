import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection, type Provider } from '@reown/appkit-adapter-solana/react'



const address = useAppKitAccount()
console.log("address:", address);


const { connection } = useAppKitConnection()
const { walletProvider } = useAppKitProvider<Provider>('solana')

