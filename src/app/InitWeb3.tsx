import { PropsWithChildren } from 'react'
import {configureChains, chain, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'


// TODO: Extraer lista de cadenas a archivo en carpeta config
const InitWeb3 = ({ children }: PropsWithChildren<{}>) => {
    // https://wagmi.sh/docs/providers/configuring-chains#multiple-providers
    const { provider, webSocketProvider } = configureChains(
        [chain.rinkeby, chain.kovan],
        [publicProvider()],
        )
    
    const client = createClient({
        autoConnect: false,
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