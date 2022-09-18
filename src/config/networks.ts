import { chain, Chain } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'


export const isTesting = process.env.REACT_APP_TESTNET == "true" ? true : false

export const defaultNetworkID = isTesting ? 4 : 1
export const validNetworkID = isTesting ? [4, 97, 43113] : [1, 56, 43114]


const avalancheChain: Chain = {
  id: 43114,
  name: 'Avalanche',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: 'https://api.avax.network/ext/bc/C/rpc',
    avax1: 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
    avax2: 'https://avalancheapi.terminet.io/ext/bc/C/rpc',
    ankr: "https://rpc.ankr.com/avalanche",
    pokt: "https://avax-mainnet.gateway.pokt.network/v1/lb/62f2849a04ec160039ea9772",
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  testnet: false,
}

const fujiChain: Chain = {
  id: 43113,
  name: 'Avalanche Fuji',
  network: 'fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://testnet.snowtrace.io' },
  },
  testnet: true,
}

const bscChain: Chain = {
  id: 56,
  name: 'BSC',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: 'https://bsc-dataseed.binance.org/',
    binance1: 'https://bsc-dataseed1.binance.org/',
    binance2: 'https://bsc-dataseed2.binance.org/',
    binance3: 'https://bsc-dataseed3.binance.org/',
    binance4: 'https://bsc-dataseed4.binance.org/',
    ankr: "https://rpc.ankr.com/bsc",
    pokt: "https://bsc-mainnet.gateway.pokt.network/v1/lb/62f2849a04ec160039ea9772",
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  testnet: false,
}

const bsctestChain: Chain = {
  id: 97,
  name: 'BSC Testnet',
  network: 'bsctest',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    binance1: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
    binance2: 'https://data-seed-prebsc-1-s3.binance.org:8545/',
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com/' },
  },
  testnet: true,
}

const mainChains = [chain.mainnet, avalancheChain, bscChain]
const testChains = [chain.rinkeby, fujiChain, bsctestChain]

export const chainsUsed = isTesting ? testChains : mainChains

export const blockExplorers = new Map()
chainsUsed.forEach((chain) => blockExplorers.set(chain.id, chain.blockExplorers?.default.url))


export const rpcProviders = [
  publicProvider({ priority: 0 }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://rpc.ankr.com/eth" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.ankr }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.ankr }
      else return null
    },
  }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://cloudflare-eth.com" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.avax1 }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.binance1 }
      else return null
    },
  }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://eth-rpc.gateway.pokt.network" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.avax2 }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.binance2 }
      else return null
    },
  }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://eth-mainnet.public.blastapi.io" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.avax1 }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.binance3 }
      else return null
    },
  }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://main-rpc.linkpool.io" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.avax2 }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.binance4 }
      else return null
    },
  }),
  jsonRpcProvider({
    priority: 0,
    rpc: (chain) => {
      if (chain.id == 1) return { http: "https://eth-mainnet.gateway.pokt.network/v1/lb/62f2849a04ec160039ea9772" }
      else if (chain.id == avalancheChain.id) return { http: chain.rpcUrls.pokt }
      else if (chain.id == bscChain.id) return { http: chain.rpcUrls.pokt }
      else return null
    },
  }),
]
