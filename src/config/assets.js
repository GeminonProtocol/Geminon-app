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

import { isTesting, validNetworkID, defaultNetworkID } from "./networks"


const contracts = isTesting ? testnetContracts : mainnetContracts


export const defaultDecimals = 18


export const gexUrlIcon = 'https://geminon.fi/tokens/gex.png'
export const gexAddress = ''
export const gexToken = {
    name: "Geminon",
    symbol: "GEX",
    key: "gex",
    decimals: defaultDecimals,
    uwdecimals: defaultDecimals,
    icon: gexIcon
}

const nativeAssets = {
    eth: {
        name: "Ethereum",
        symbol: "ETH",
        key: "eth",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: ethIcon,
    }, 
    bnb: {
        name: "BNB",
        symbol: "BNB",
        key: "bnb",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: bnbIcon,
    }, 
    avax: {
        name: "Avalanche",
        symbol: "AVAX",
        key: "avax",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: avaxIcon,
    }, 
}


const ethAssets = {
    gex: gexToken, 
    // renbtc: {
    //     name: "Ren Bitcoin",
    //     symbol: "RENBTC",
    //     key: "renbtc",
    //     decimals: defaultDecimals,
    //     uwdecimals: 8,
    //     icon: renbtcIcon,
    // },
    paxg: {
        name: "PAX Gold",
        symbol: "PAXG",
        key: "paxg",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: paxgIcon,
    },
    xaut: {
        name: "Tether Gold",
        symbol: "XAUT",
        key: "xaut",
        decimals: defaultDecimals,
        uwdecimals: 6,
        icon: xautIcon,
    },
}

const bnbAssets = {
    gex: gexToken, 
    renbtc: {
        name: "Ren Bitcoin",
        symbol: "RENBTC",
        key: "renbtc",
        decimals: defaultDecimals,
        uwdecimals: 8,
        icon: renbtcbnbIcon,
    },
}

const avaxAssets = {
    gex: gexToken, 
    btcb: {
        name: "Avalanche Bridged Bitcoin",
        symbol: "BTC.b",
        key: "btcb",
        decimals: defaultDecimals,
        uwdecimals: 8,
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


