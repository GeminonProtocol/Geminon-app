import mainnetContracts from "./deployments/mainnet_contracts_info.json"
import testnetContracts from "./deployments/testnet_contracts_info.json"

import { defaultNetworkID } from "./networks"


const isTesting = process.env.NODE_ENV == "production" ? false : 
    process.env.REACT_APP_TESTNET == "true" ? true : false

const contracts = isTesting ? testnetContracts : mainnetContracts


export const getPoolContracts = (networkID) => {
    // console.log("[CONFIG][contracts][getPoolContracts] networkID, defaultID", networkID, defaultNetworkID)
    const networkData = contracts[networkID] ?? contracts[defaultNetworkID]
    // console.log("[CONFIG][contracts][getPoolContracts] network data", networkData)
    return networkData.glp
}


