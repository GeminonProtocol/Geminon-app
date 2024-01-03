import { PropsWithChildren, useMemo } from "react"
import { useAccount, useNetwork } from 'wagmi'

import { Card } from "components/layout"
import createContext from "utils/createContext"

import { getStableAssetsList } from "config/assets.js"
import { defaultNetworkID } from "config/networks"


interface StableSwap {
    networkID: number
    tokensList: TokenEVM[]
}

export const [useStableSwap, StableSwapProvider] = createContext<StableSwap>("useStableSwap")


const StableSwapContext = ({ children }: PropsWithChildren<{}>) => {
    const { isConnected } = useAccount()
    const { chain } = useNetwork()
    const networkID = chain?.id ?? defaultNetworkID

    const context = useMemo(() => {
        const stablecoinsList: TokenEVM[] = getStableAssetsList(networkID)
        return { networkID, tokensList: stablecoinsList }
    }, [chain])

    const cardKey = networkID + (isConnected ? 1 : 0)

    const render = () => {
        if (!context) return null
        return <StableSwapProvider value={context}>{children}</StableSwapProvider>
    }

return <Card key={cardKey}>{render()}</Card>
}

export default StableSwapContext
