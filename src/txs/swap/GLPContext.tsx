import { PropsWithChildren, useMemo } from "react"
import createContext from "utils/createContext"
import { Card } from "components/layout"

import { useAccount, useNetwork } from 'wagmi'

import getAssetsList from "config/assets.js"
import { defaultNetworkID } from "config/networks"


interface GLP {
  networkID: number
  nativeAsset: AssetEVM
  tokensList: TokenEVM[]
}

export const [useGLP, GLPProvider] = createContext<GLP>("useSingleSwap")


const GLPContext = ({ children }: PropsWithChildren<{}>) => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const networkID = chain?.id ?? defaultNetworkID

  
  const context = useMemo(() => {
    
    const { nativeAsset, tokensList } = getAssetsList(networkID)

    // console.log("[GLPContext] networkId=", networkID, " connected chain id=", chain?.id)
    // console.log("[GLPContext] nativeAsset", nativeAsset)
    
    return { networkID, nativeAsset, tokensList }
  }, [chain])


  const cardKey = networkID + (isConnected ? 1 : 0)

  const render = () => {
    if (!context) return null
    return <GLPProvider value={context}>{children}</GLPProvider>
  }

  return <Card key={cardKey}>{render()}</Card>
}

export default GLPContext
