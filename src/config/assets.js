import ethIcon from "../styles/images/tokens/eth.png"
import bnbIcon from "../styles/images/tokens/bnb.png"
import avaxIcon from "../styles/images/tokens/avax.png"

import renbtcIcon from "../styles/images/tokens/renBTC.svg"
import paxgIcon from "../styles/images/tokens/paxg.png"
import xautIcon from "../styles/images/tokens/xaut.png"
import btcbIcon from "../styles/images/tokens/bbtc.png"

import gexIcon from "../styles/images/tokens/gex.png"
import usdiIcon from "../styles/images/tokens/usdi.png"
import euriIcon from "../styles/images/tokens/euri.png"
import usdgIcon from "../styles/images/tokens/usdg.png"
// import eurgIcon from "../styles/images/tokens/eurg.png"

import mainnetContracts from "./deployments/mainnet_contracts_info.json"
import testnetContracts from "./deployments/testnet_contracts_info.json"

import { isTesting, validNetworkID, defaultNetworkID } from "./networks"


const contracts = isTesting ? testnetContracts : mainnetContracts


export const defaultDecimals = 18


export const gexUrlIcon = 'https://geminon.fi/tokens/gex_128x128.png'

const gexToken = {
    name: "Geminon",
    symbol: "GEX",
    key: "gex",
    decimals: defaultDecimals,
    uwdecimals: defaultDecimals,
    icon: gexIcon,
    urlicon: gexUrlIcon
}

const stableAssets = {
    usdi: {
        name: "CPI Indexed USD",
        symbol: "USDI",
        key: "usdi",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: usdiIcon,
        urlicon: 'https://geminon.fi/tokens/usdi_128x128.png'
    },
    euri: {
        name: "HICP Indexed Euro",
        symbol: "EURI",
        key: "euri",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: euriIcon,
        urlicon: 'https://geminon.fi/tokens/euri_128x128.png'
    },
    usdg: {
        name: "Geminon US Dollar",
        symbol: "USDG",
        key: "usdg",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: usdgIcon,
        urlicon: 'https://geminon.fi/tokens/usdg_128x128.png'
    },
    // eurg: {
    //     name: "Geminon Euro",
    //     symbol: "EURG",
    //     key: "eurg",
    //     decimals: defaultDecimals,
    //     uwdecimals: defaultDecimals,
    //     icon: eurgIcon,
    //     urlicon: 'https://geminon.fi/tokens/eurg_128x128.png'
    // },
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
    renbtc: {
        name: "Ren Bitcoin",
        symbol: "RENBTC",
        key: "renbtc",
        decimals: defaultDecimals,
        uwdecimals: 8,
        icon: renbtcIcon,
        urlicon: 'https://geminon.fi/tokens/renBTC.svg'
    },
    paxg: {
        name: "PAX Gold",
        symbol: "PAXG",
        key: "paxg",
        decimals: defaultDecimals,
        uwdecimals: defaultDecimals,
        icon: paxgIcon,
        urlicon: 'https://geminon.fi/tokens/paxg.png'
    },
    xaut: {
        name: "Tether Gold",
        symbol: "XAUT",
        key: "xaut",
        decimals: defaultDecimals,
        uwdecimals: 6,
        icon: xautIcon,
        urlicon: 'https://geminon.fi/tokens/xaut.png'
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
        icon: renbtcIcon,
        urlicon: 'https://geminon.fi/tokens/renBTC.svg'
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
        urlicon: 'https://geminon.fi/tokens/bbtc.png'
    },
}



export const getGEXToken = (networkID) => {
    const validNetID = validNetworkID.includes(networkID) ? networkID : defaultNetworkID
    return {...gexToken, address: contracts[validNetID].tokens.gex}
}

export const getPoolAssetsList = (networkID) => {
    const validNetID = validNetworkID.includes(networkID) ? networkID : defaultNetworkID
    // console.log("[CONFIG][assets][getAssetsList] networkID, validNetID", networkID, validNetID)
    const tokensData = contracts[validNetID].tokens

    const mapNative = {
        1: nativeAssets.eth,
        4: nativeAssets.eth,
        5: nativeAssets.eth,
        42: nativeAssets.eth,
        56: nativeAssets.bnb,
        97: nativeAssets.bnb,
        43113: nativeAssets.avax,
        43114: nativeAssets.avax,
    }

    const mapAssets = {
        1: ethAssets,
        4: ethAssets,
        5: ethAssets,
        42: ethAssets,
        56: bnbAssets,
        97: bnbAssets,
        43113: avaxAssets,
        43114: avaxAssets,
    }

    const nativeAsset = mapNative[validNetID]
    const netTokens = mapAssets[validNetID]
    
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


export const getStableAssetsList = (networkID) => {
    const validNetID = validNetworkID.includes(networkID) ? networkID : defaultNetworkID
    // console.log("[CONFIG][assets][getMinterAssetsList] networkID, validNetID", networkID, validNetID)
    const stablecoinsData = contracts[validNetID].stablecoins
    
    const stablecoinsList = []
    for (const key in stableAssets) {        
        stablecoinsList.push({
            ...stableAssets[key],
            address: stablecoinsData[key]
        })
    }

    // console.log("[CONFIG][assets][getMinterAssetsList] nativeAsset, tokensList", nativeAsset, tokensList)
    return stablecoinsList
}


export const getAllTokensList = (networkID) => {
    const { tokensList } = getPoolAssetsList(networkID)
    const stablecoinsList = getStableAssetsList(networkID)
    return [...tokensList, ...stablecoinsList]
}

export const getToken = (networkID, tokenSymbol) => {
    const tokensList = getAllTokensList(networkID)
    return tokensList.find((item) => item.symbol === tokenSymbol)
}
