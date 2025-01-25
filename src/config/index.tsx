import { cookieStorage, createStorage } from "wagmi";
// import { wagmiAdapter } from "reown/appkit-adapter-wagmi";
// import { devnet } from "reown/appkit/networks";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";


export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID 

if (!projectId) {
    throw new Error("Project ID is noe defined.")
}

// export const networks = [ solana, solanaDevnet]

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    networks: [solana, solanaDevnet, solanaTestnet],
    projectId
})

export const config = wagmiAdapter.wagmiConfig