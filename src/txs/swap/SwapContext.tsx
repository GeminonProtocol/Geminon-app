import { PropsWithChildren } from "react"
import { Coins } from "@terra-money/terra.js"
import createContext from "utils/createContext"
// import { combineState } from "data/query"
// import { useActiveDenoms, useExchangeRates } from "data/queries/oracle"
import { TerraContracts } from "data/Terra/TerraAssets"
// import { useCW20Pairs } from "data/Terra/TerraAssets"
// import { useTerraContracts } from "data/Terra/TerraAssets"
import { Fetching } from "components/feedback"


interface Swap {
  activeDenoms: Denom[]
  exchangeRates?: Coins
  pairs: CW20Pairs
  contracts?: TerraContracts
}


export const [useSwap, SwapProvider] = createContext<Swap>("useSwap")

// ESTE COMPONENTE SE UTILIZA SOLO PARA PASAR ESTOS DATOS A LAS FUNCIONES
// DEL MÓDULO useSwapUtils, que es un hook que proporciones funcionalidades
// a otros componentes. Si no se va a usar ese hook, es seguro eliminar este
// componente (te ahorro un click: no se usan ya).
const SwapContext = ({ children }: PropsWithChildren<{}>) => {
  
  const activeDenoms = [
    'uluna', 'uusd', 'uaud', 'ucad', 'uchf', 'ucny', 'udkk', 'ueur', 'ugbp', 
    'uhkd', 'uidr', 'uinr', 'ujpy', 'ukrw', 'umnt', 'umyr', 'unok', 'uphp', 
    'usdr', 'usek', 'usgd', 'uthb', 'utwd'
  ]
  // console.log('Active Denoms:')
  // console.log(activeDenoms)

  // const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()
  // Esto se utiliza solo para simular el swap en modo ONCHAIN (Market)
  const exchangeRates = {
    _coins: {
      uusd: {denom: "uusd", amount: 1027.46332339911000},
      ueur: {denom: "ueur", amount: 1009.12207561311000}
    }
  }
  // console.log('Exchange Rates:')
  // console.log(exchangeRates)
  // console.log(exchangeRatesState)
  
  
  const pairs = {
    terra1afdz4l9vsqddwmjqxmel99atu4rwscpfjm4yfp: {
      assets: ['uusd', 'terra1w7zgkcyt7y4zpct9dw8mw362ywvdlydnum2awa'],
      dex: "terraswap",
      type: "xyk"
    },
    terra1d7028vhd9u26fqyreee38cj39fwqvcyjps8sjk: {
      assets: ['uusd', 'terra1mpq5zkkm39nmjrjg9raknpfrfmcfwv0nh0whvn'],
      dex: "astroport",
      type: "xyk"
    } 
  } as CW20Pairs
  // console.log('Pairs:')
  // console.log(pairs)
  
  const contracts = {
    assertLimitOrder: "terra1vs9jr7pxuqwct3j29lez3pfetuu8xmq7tk3lzk",
    routeswap: "terra19qx5xe6q9ll4w0890ux7lv2p4mf3csd4qvt3ex",
    tnsRegistry: "terra19gqw63xnt9237d2s8cdrzstn98g98y7hkl80gs",
    tnsReverseRecord: "terra13efj2whf6rm7yedc2v7rnz0e6ltzytyhydy98a"
  }
  // console.log('Contracts:')
  // console.log(contracts)
  
    
  // const state = combineState(
  //   // activeDenomsState,
  //   // exchangeRatesState,
  //   // cw20PairsState,
  //   // contractsState
  // )
  // MOCK STATE
  const state = {
    error: undefined,
    isFetching: false,
    isIdle: false,
    isLoading: false,
    isSuccess: true
  }
  // console.log('Combined state')
  // console.log(state)

  
  const render = () => {
    if (!(activeDenoms && exchangeRates && pairs && contracts)) return null
    const value = { activeDenoms, /* exchangeRates, */ pairs, contracts }
    return <SwapProvider value={value}>{children}</SwapProvider>
  }

  // console.log("SwapContext OK")
  return !state.isSuccess ? null : <Fetching {...state}>{render()}</Fetching>
}


/* const SwapContext = ({ children }: PropsWithChildren<{}>) => {
  const { data: activeDenoms, ...activeDenomsState } = useActiveDenoms()
  const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()
  const { data: pairs, ...cw20PairsState } = useCW20Pairs()
  const { data: contracts, ...contractsState } = useTerraContracts()

  const state = combineState(
    activeDenomsState,
    exchangeRatesState,
    contractsState,
    cw20PairsState
  )

  const render = () => {
    if (!(activeDenoms && exchangeRates && pairs && contracts)) return null
    const value = { activeDenoms, exchangeRates, pairs, contracts }
    return <SwapProvider value={value}>{children}</SwapProvider>
  }

  return !state.isSuccess ? null : <Fetching {...state}>{render()}</Fetching>
} */


export default SwapContext
