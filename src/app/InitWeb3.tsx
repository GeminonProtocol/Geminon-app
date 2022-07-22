import { PropsWithChildren } from 'react'
import {configureChains, chain, createClient, WagmiConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'


// TODO: Extraer lista de cadenas a archivo en carpeta config
const InitWeb3 = ({ children }: PropsWithChildren<{}>) => {
    // https://wagmi.sh/docs/providers/configuring-chains#multiple-providers
    const { chains, provider, webSocketProvider } = configureChains(
        [chain.rinkeby, chain.kovan],
        [publicProvider()],
        )
    
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
        </WagmiConfig>
    )
} 


export default InitWeb3