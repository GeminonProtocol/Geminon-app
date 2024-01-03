import { PropsWithChildren, useMemo } from "react"
import { useAccount, useNetwork } from 'wagmi'

import { Card } from "components/layout"
import createContext from "utils/createContext"

import { getGEXToken, getNativeAsset } from "config/assets.js"
import { defaultNetworkID } from "config/networks"


interface Redeem {
  networkID: number
  gexToken: TokenEVM
  nativeAsset: AssetEVM
}

export const [useRedeem, RedeemProvider] = createContext<Redeem>("useRedeem")


const RedeemContext = ({ children }: PropsWithChildren<{}>) => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const networkID = chain?.id ?? defaultNetworkID

  const context = useMemo(() => {
    const gexToken = getGEXToken(networkID)
    const nativeAsset = getNativeAsset(networkID)
    return { networkID, gexToken, nativeAsset }
  }, [chain])

  const cardKey = networkID + (isConnected ? 1 : 0)

  const render = () => {
    if (!context) return null
    return <RedeemProvider value={context}>{children}</RedeemProvider>
  }

  return <Card key={cardKey}>{render()}</Card>
}

export default RedeemContext
