import { PropsWithChildren, useState } from "react"
// import { fromPairs } from "ramda"
// import axios from "axios"
// import { ASSETS } from "config/constants"
import { validNetworks } from "config/networks"
import createContext from "utils/createContext"
// import { useCustomNetworks } from "data/settings/CustomNetworks"
import { useNetworkState } from "data/wallet"


const terraNetworks = {
  mainnet: {
    name: "mainnet",
    chainID: "phoenix-1",
    lcd: "https://phoenix-lcd.terra.dev",
    api: "https://phoenix-api.terra.dev",
    hive: "https://phoenix-hive.terra.dev/graphql",
    walletconnectID: 1
  },
  classic: {
    name: "classic",
    chainID: "columbus-5",
    lcd: "https://columbus-lcd.terra.dev",
    api: "https://columbus-api.terra.dev",
    mantle: "https://columbus-mantle.terra.dev",
    walletconnectID: 2
  },
  testnet: {
    name: "testnet",
    chainID: "pisco-1",
    lcd: "https://pisco-lcd.terra.dev",
    api: "https://pisco-api.terra.dev",
    hive: "https://pisco-hive.terra.dev/graphql",
    walletconnectID: 0
  },
  localterra: {
    name: "localterra",
    chainID: "localterra",
    lcd: "http://localhost:1317",
    mantle: "http://localhost:1337"
  }
}


export const [useNetworks, NetworksProvider] = createContext<CustomNetworks>("useNetworks")


const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<CustomNetworks>(terraNetworks)
  
  const [network, setNetwork] = useNetworkState()
  setNetwork("classic") // Necesario para que funcione el módulo de swaps
  console.log("Selected network:")
  console.log(network)
  console.log("EVM networks:")
  console.log(validNetworks)
  console.log("Loaded networks:")
  console.log(networks)
  console.log('InitNetworks OK')
  
  return <NetworksProvider value={networks}>{children}</NetworksProvider>
}


// Se puede encontrar el valor del estado "networks" en el archivo networks.json del directorio raíz  
/* const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<CustomNetworks>()
  const { list } = useCustomNetworks()

  useEffect(() => {
    const fetchChains = async () => {
      const { data: chains } = await axios.get<TerraNetworks>("/chains.json", {
        baseURL: ASSETS,
      })

      const networks = {
        ...chains,
        localterra: { ...chains.localterra, preconfigure: true },
      }

      setNetworks({
        ...networks,
        ...fromPairs(list.map((item) => [item.name, item])),
      })
    }

    fetchChains()
  }, [list])

  if (!networks) return null
  return <NetworksProvider value={networks}>{children}</NetworksProvider>
} */

export default InitNetworks
