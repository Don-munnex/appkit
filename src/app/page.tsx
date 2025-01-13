import { useAccount } from "wagmi";
import WalletContextProvider, { CustomWalletMultiButton } from "./connection";
// "use client";

export default function Home() {
  return (
    <div className="">
      <WalletContextProvider>
      <h1>okarfabianthewise appkit</h1>
      <CustomWalletMultiButton/>
      </WalletContextProvider>
    </div>
  );
}
