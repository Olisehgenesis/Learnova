import client from "../lib/client";
import { base, baseSepolia } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";

import {inAppWallet, createWallet } from "thirdweb/wallets";




const coinBaseWallet = createWallet("com.coinbase.wallet"); // pass the wallet id

const inAppwallet = inAppWallet(

)
// Define tokens for both Base and BaseSepolia networks
const tokensBase = [
    {
        address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        name: "USDC",
        symbol: "USDC",
    },
];

const tokensBaseSepolia = [
    {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        name: "USDC",
        symbol: "USDC",
    },
];
const ConnectButtonComponent = () => {
    return (
        <ConnectButton
            client={client}
            chain={baseSepolia} // Default chain
            chains={[base, baseSepolia]} // Supported chains
            recommendedWallets={[coinBaseWallet]}
            wallets={[coinBaseWallet, inAppwallet]}
            supportedTokens={{
                [base.id]: tokensBase, // Tokens for Base
                [baseSepolia.id]: tokensBaseSepolia, // Tokens for Base Sepolia
            }}
            connectButton={{
                className:
                    "bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded text-xl",
                label: "Connect Wallet",
            }}
            switchButton={{
                className:
                    "bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded text-xl",
                label: "Switch Network",
            }}
            signInButton={{
                className:
                    "bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded text-xl",
                label: "Sign In",
            }}
            theme="light"
        />
    );
};

export default ConnectButtonComponent;
