import { PropsWithChildren, useMemo } from "react"
import { useAccount, useNetwork } from 'wagmi'

import { Card } from "components/layout"
import createContext from "utils/createContext"

import { getStableAssetsList, getGEXToken } from "config/assets.js"
import { defaultNetworkID } from "config/networks"


interface SCM {
    networkID: number
    tokensList: TokenEVM[]
}

export const [useSCM, SCMProvider] = createContext<SCM>("useSCM")


const SCMinterContext = ({ children }: PropsWithChildren<{}>) => {
    const { isConnected } = useAccount()
    const { chain } = useNetwork()
    const networkID = chain?.id ?? defaultNetworkID

    const context = useMemo(() => {
        const gexToken: TokenEVM = getGEXToken(networkID)
        const stablecoinsList: TokenEVM[] = getStableAssetsList(networkID)
        return { networkID, tokensList: [gexToken, ...stablecoinsList] }
    }, [chain])


    const cardKey = networkID + (isConnected ? 1 : 0)

    const render = () => {
        if (!context) return null
        return <SCMProvider value={context}>{children}</SCMProvider>
    }

return <Card key={cardKey}>{render()}</Card>
}


export default SCMinterContext
