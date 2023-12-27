import { useNetwork, useSwitchNetwork } from 'wagmi'
import { RadioGroup } from "components/form"

import { defaultNetworkID } from "../../config/networks"


const NetworkSetting = () => {
  const { chain, chains } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  
  const network = chain?.id ?? defaultNetworkID
  const networkOptions = chains.map((chain) => {
    return {
      value: chain.id,
      label: chain.name
    }
  })

  if (!networkOptions) return null

  return (
    <>
      <RadioGroup
        options={networkOptions}
        value={network}
        onChange={(chain) => switchNetwork?.(chain)}
      />
    </>
  )
}

export default NetworkSetting

