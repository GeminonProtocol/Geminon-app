import { atom, useRecoilState, useRecoilValue } from "recoil"
// import { useWallet } from "@terra-money/wallet-provider"
import { useNetworks } from "app/InitNetworks"
import { sandbox } from "../scripts/env"
import { getStoredNetwork, storeNetwork } from "../scripts/network"


const networkState = atom({
  key: "network",
  default: getStoredNetwork(),
})

export const useNetworkState = () => {
  const [network, setNetwork] = useRecoilState(networkState)

  const changeNetwork = (network: NetworkName) => {
    setNetwork(network)
    storeNetwork(network)
  }

  return [network, changeNetwork] as const
}

/* helpers */
export const useNetworkOptions = () => {
  const networks = useNetworks()

  if (!sandbox) return

  return Object.values(networks).map(({ name }) => {
    return { value: name, label: name }
  })
}

/* Devuelve la red almacenada actualmente en el almacenamiento
 * local de la página web (ver useNetworkState más arriba, proporciona
 * el método changeNetwork para hacerlo aunque no aparece ninguna
 * referencia en todo el código de la app que lo use). Si no hay
 * ninguno, devuelve la mainnet. */
export const useNetwork = (): CustomNetwork => {
  const networks = useNetworks()
  const network = useRecoilValue(networkState)

  return networks[network] ?? networks.mainnet
}

/* export const useNetwork = (): CustomNetwork => {
  const networks = useNetworks()
  const network = useRecoilValue(networkState)
  const wallet = useWallet()

  if (sandbox) return networks[network] ?? networks.mainnet
  return wallet.network
} */


export const useNetworkName = () => {
  const { name } = useNetwork()
  return name
}

export const useChainID = () => {
  const { chainID } = useNetwork()
  return chainID
}
