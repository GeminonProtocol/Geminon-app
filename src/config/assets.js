import ethIcon from "../styles/images/tokens/eth.png"
import gexIcon from "../styles/images/tokens/gex.png"
import renbtcIcon from "../styles/images/tokens/renBTC.svg"
import paxgIcon from "../styles/images/tokens/paxg.png"
import xautIcon from "../styles/images/tokens/xaut.png"
import bnbIcon from "../styles/images/tokens/bnb.png"
import renbtcbnbIcon from "../styles/images/tokens/renbtc_bnb.png"
import avaxIcon from "../styles/images/tokens/avax.png"
import btcbIcon from "../styles/images/tokens/bbtc.png"

import mainnetContracts from "./deployments/mainnet_contracts_info.json"
import testnetContracts from "./deployments/testnet_contracts_info.json"

import { validNetworkID, defaultNetworkID } from "./networks"



const isTesting = process.env.NODE_ENV == "production" ? false : 
    process.env.REACT_APP_TESTNET == "true" ? true : false
const contracts = isTesting ? testnetContracts : mainnetContracts



export const defaultDecimals = 18

const nativeAssets = {
    eth: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: defaultDecimals,
        icon: ethIcon,
    }, 
    bnb: {
        name: "BNB",
        symbol: "BNB",
        decimals: defaultDecimals,
        icon: bnbIcon,
    }, 
    avax: {
        name: "Avalanche",
        symbol: "AVAX",
        decimals: defaultDecimals,
        icon: avaxIcon,
    }, 
}


const ethAssets = {
    gex: {
        name: "Geminon",
        symbol: "GEX",
        decimals: defaultDecimals,
        icon: gexIcon,
    }, 
    renbtc: {
        name: "Ren Bitcoin",
        symbol: "RENBTC",
        decimals: defaultDecimals,
        icon: renbtcIcon,
    },
    paxg: {
        name: "PAX Gold",
        symbol: "PAXG",
        decimals: defaultDecimals,
        icon: paxgIcon,
    },
    xaut: {
        name: "Tether Gold",
        symbol: "XAUT",
        decimals: defaultDecimals,
        icon: xautIcon,
    },
}

const bnbAssets = {
    gex: {
        name: "Geminon",
        symbol: "GEX",
        decimals: defaultDecimals,
        icon: gexIcon,
    }, 
    renbtc: {
        name: "Ren Bitcoin",
        symbol: "RENBTC",
        decimals: defaultDecimals,
        icon: renbtcbnbIcon,
    },
}

const avaxAssets = {
    gex: {
        name: "Geminon",
        symbol: "GEX",
        decimals: defaultDecimals,
        icon: gexIcon,
    }, 
    btcb: {
        name: "Avalanche Bridged Bitcoin",
        symbol: "BTC.b",
        decimals: defaultDecimals,
        icon: btcbIcon,
    },
}



const getAssetsList = (networkID) => {
    const validNetID = validNetworkID.includes(networkID) ? networkID : defaultNetworkID
    // console.log("[CONFIG][assets][getAssetsList] networkID, validNetID", networkID, validNetID)
    const tokensData = contracts[validNetID].tokens

    const mapNative = {
        1: nativeAssets.eth,
        4: nativeAssets.eth,
        42: nativeAssets.eth,
        56: nativeAssets.bnb,
        97: nativeAssets.bnb,
        43113: nativeAssets.avax,
        43114: nativeAssets.avax,
    }

    const mapAssets = {
        1: ethAssets,
        4: ethAssets,
        42: ethAssets,
        56: bnbAssets,
        97: bnbAssets,
        43113: avaxAssets,
        43114: avaxAssets,
    }

    const nativeAsset = mapNative[validNetID]
    const netTokens =  mapAssets[validNetID]
    
    const tokensList = []
    for (const key in netTokens) {        
        tokensList.push({
            ...netTokens[key],
            address: tokensData[key]
        })
    }

    // console.log("[CONFIG][assets][getAssetsList] nativeAsset, tokensList", nativeAsset, tokensList)
    return {nativeAsset, tokensList}
}

export default getAssetsList


