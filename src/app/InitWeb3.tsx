import { PropsWithChildren } from 'react'
import {configureChains, createClient, WagmiConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import Online from "./containers/Online"

import {chainsUsed, rpcProviders} from "../config/networks"


const InitWeb3 = ({ children }: PropsWithChildren<{}>) => {
  const { chains, provider, webSocketProvider } = configureChains(chainsUsed, rpcProviders)
  // console.log("[INITWEB3] chainsUsed:", chainsUsed)
  // console.log("[INITWEB3] chains:", chains)
  const client = createClient({
    autoConnect: false,
    connectors: [
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
        },
      }),
      ],
    provider,
    webSocketProvider,
  })

  return (
    <WagmiConfig client={client}>
      {children}
      <Online />
    </WagmiConfig>
  )
} 


export default InitWeb3
