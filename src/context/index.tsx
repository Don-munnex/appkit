'use client'

import {wagmiAdapter, projectId } from "../config/index"
import { createAppKit } from "@reown/appkit"
import { solana, solanaDevnet } from "@reown/appkit/networks"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { type ReactNode } from "react"
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient( )

if(!projectId) {
    throw new Error("project ID not defined.")
}

const metadata = {
    name: "appkit-example",
    description: "Appkit Example - EVM",
    url: " ",
    icons: [" "]
}

const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [solana, solanaDevnet],
    defaultNetwork: solanaDevnet,
    features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'github', 'discord', 'farcaster'],
        emailShowWallets: true
    },
    themeMode: "dark",
    projectId
})

function ContextProvider({children, cookies}: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}


export default ContextProvider;
