import mainnetContracts from "./deployments/mainnet_contracts_info.json"
import testnetContracts from "./deployments/testnet_contracts_info.json"

import { isTesting, defaultNetworkID } from "./networks"


const contracts = isTesting ? testnetContracts : mainnetContracts


export const getPoolContracts = (networkID) => {
    // console.log("[CONFIG][contracts][getPoolContracts] networkID, defaultID", networkID, defaultNetworkID)
    const networkData = contracts[networkID] ?? contracts[defaultNetworkID]
    // console.log("[CONFIG][contracts][getPoolContracts] network data", networkData)
    return networkData.glp
}


