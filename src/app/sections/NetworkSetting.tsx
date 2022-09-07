// import { useTranslation } from "react-i18next"
// import { useNetworkOptions, useNetworkState } from "data/wallet"
// import { useCustomNetworks } from "data/settings/CustomNetworks"
// import { InternalLink } from "components/general"
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


// const NetworkSetting = () => {
//   const { t } = useTranslation()
//   const [network, setNetwork] = useNetworkState()
//   const networkOptions = useNetworkOptions()
//   const { list } = useCustomNetworks()

//   if (!networkOptions) return null

//   return (
//     <>
//       <RadioGroup
//         options={networkOptions}
//         value={network}
//         onChange={setNetwork}
//       />

//       {list.length ? (
//         <InternalLink to="/networks" chevron>
//           {t("Manage networks")}
//         </InternalLink>
//       ) : (
//         <InternalLink to="/network/new" chevron>
//           {t("Add a network")}
//         </InternalLink>
//       )}
//     </>
//   )
// }