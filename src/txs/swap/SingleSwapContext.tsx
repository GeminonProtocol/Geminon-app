import { PropsWithChildren, useMemo } from "react"
// import { flatten, uniq, zipObj } from "ramda"
import BigNumber from "bignumber.js"
import { isDenomIBC, toAmount } from "@terra.kitchen/utils"
import { AccAddress } from "@terra-money/terra.js"
// import { getAmount, sortDenoms } from "utils/coin"
import { toPrice } from "utils/num"
import createContext from "utils/createContext"
// import { useCurrency } from "data/settings/Currency"
// import { combineState, useIsClassic } from "data/query"
import { useBankBalance } from "data/queries/bank"
// import { useTokenBalances } from "data/queries/wasm"
// import { readIBCDenom, readNativeDenom } from "data/token"
// import { useIBCWhitelist } from "data/Terra/TerraAssets"
// import { useCW20Whitelist } from "data/Terra/TerraAssets"
// import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { Card } from "components/layout"
// import { useSwap } from "./SwapContext"
import { SwapAssets, validateAssets } from "./useSwapUtils"
// import { constSelector } from "recoil"


export interface SlippageParams extends SwapAssets {
  input: number
  slippageInput: number
  ratio: number
}

export interface SwapSpread {
  max_spread: string
  minimum_receive: string
  belief_price: string
  price: number
}

interface SingleSwap {
  options: {
    coins: TokenItemWithBalance[]
    tokens: TokenItemWithBalance[]
  }
  findTokenItem: (token: Token) => TokenItemWithBalance
  findDecimals: (token: Token) => number
  calcExpected: (params: SlippageParams) => SwapSpread
}


export const [useSingleSwap, SingleSwapProvider] = createContext<SingleSwap>("useSingleSwap")


// PROPORCIONA LAS LISTAS DE TOKENS PARA EL SWAP Y LOS BALANCES DE CADA UNO
// RENOMBRAR A GLPContext y dejar como único contexto de SwapForm
const SingleSwapContext = ({ children }: PropsWithChildren<{}>) => {
  // const currency = "uluna"
  // const isClassic = true
  // const bankBalance = {
  //   _coins: {
  //     uluna: {denom: 'uluna', amount: 757869711},
  //     uusd: {denom: 'uusd', amount: 19103}
  //   }
  // }

  // const { activeDenoms, pairs } = useSwap() // Modificado en SwapContext. TODO: Eliminar este contexto
  
  // const customTokens = [] as Token[]

  
  /* contracts */
  // LISTAS DE TOKENS
  // const { data: ibcWhitelist, ...ibcWhitelistState } = useIBCWhitelist()
  // const ibcWhitelist = {
  //   EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09: {
  //     base_denom: "uscrt",
  //     denom: "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09",
  //     icon: "https://assets.terra.money/icon/svg/ibc/SCRT.svg",
  //     name: "Secret",
  //     path: "transfer/channel-16",
  //     symbol: "SCRT"
  //   }
  // } as IBCWhitelist
  // console.log('[SINGLESWAPCONTEXT] ibcWhiteList:')
  // console.log(ibcWhitelist)

  // const { data: cw20Whitelist, ...cw20WhitelistState } = useCW20Whitelist()
  // const cw20Whitelist = {
  //   terra1aa7upykmmqqc63l924l5qfap8mrmx5rfdm0v55: {
  //     decimals: 8,
  //     icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png",
  //     name: "Wrapped BTC (Portal)",
  //     protocol: "Wormhole",
  //     symbol: "WBTC",
  //     token: "terra1aa7upykmmqqc63l924l5qfap8mrmx5rfdm0v55"
  //   }
  // } as CW20Whitelist
  // console.log('[SINGLESWAPCONTEXT] cw20WhiteList:')
  // console.log(cw20Whitelist)

  // Why?
  // To search tokens with symbol (ibc, cw20)
  // To filter tokens with balance (cw20)
  // Filtrar listas de tokens -> TODO: Eliminar
  // const terraswapAvailableList = useMemo(() => {
  //   if (!(ibcWhitelist && cw20Whitelist)) return

  //   const terraswapAvailableList = uniq(
  //     flatten(Object.values(pairs).map(({ assets }) => assets))
  //   )

  //   const ibc = terraswapAvailableList
  //     .filter(isDenomIBC)
  //     .filter((denom) => ibcWhitelist[denom.replace("ibc/", "")])

  //   const cw20 = terraswapAvailableList
  //     .filter(AccAddress.validate)
  //     .filter((token) => cw20Whitelist[token])

  //   return { ibc, cw20 }
  // }, [cw20Whitelist, ibcWhitelist, pairs])



  // BALANCES DE TOKENS (NO MONEDAS, NO TENEMOS NINGUNA)
  // Fetch cw20 balances: only listed and added by the user
  // const cw20TokensBalanceRequired = useMemo(() => {
  //   if (!terraswapAvailableList) return []
  //   return customTokens.filter((token) =>
  //     terraswapAvailableList.cw20.includes(token)
  //   )
  // }, [customTokens, terraswapAvailableList])

  // const cw20TokensBalancesState = useTokenBalances(cw20TokensBalanceRequired)
  // const cw20TokensBalancesState = [] 
  // console.log('[SINGLESWAPCONTEXT] cw20TokensBalancesState:')
  // console.log(cw20TokensBalancesState)

  // const cw20TokensBalances = useMemo(() => {
  //   if (cw20TokensBalancesState.some(({ isSuccess }) => !isSuccess)) return

  //   return zipObj(
  //     cw20TokensBalanceRequired,
  //     cw20TokensBalancesState.map(({ data }) => {
  //       if (!data) throw new Error()
  //       return data
  //     })
  //   )
  // }, [cw20TokensBalanceRequired, cw20TokensBalancesState])

  
  // CONTEXTO PARA EL SWAP
  const context = useMemo(() => {
    // if (!(terraswapAvailableList && ibcWhitelist && cw20Whitelist)) return
    // if (!cw20TokensBalances) return

    /* options contiene las listas de monedas y tokens. Tiene la forma:
    options = {
      coins: [
        {
          balance: "19103"
          decimals: 6
          icon: "https://assets.terra.money/icon/svg/Terra/UST.svg"
          name: "Terra USD"
          symbol: "USTC"
          token: "uusd"
        },
        {
          balance: "0"
          decimals: 6
          icon: "https://assets.terra.money/icon/svg/Terra/EUT.svg"
          name: "Terra EUR"
          symbol: "EUTC"
          token: "ueur"
        },
        ...
      ]
      tokens: [
        {
          balance: "0"
          decimals: 8
          icon: "https://static.lido.fi/stSOL/stSOL.png"
          name: "Lido wstSOL (Portal)"
          protocol: "Wormhole"
          symbol: "wstSOL"
          token: "terra1t9ul45l7m6jw6sxgvnp8e5hj8xzkjsg82g84ap"
        },
        ...
      ]
    }
    */
    const options = {
      coins: [
        {
          balance: "757869711",
          decimals: 6,
          icon: "https://assets.terra.money/icon/svg/LUNC.svg",
          name: undefined,
          symbol: "LUNC",
          token: "uluna",
        },
        {
          balance: "19103",
          decimals: 6,
          icon: "https://assets.terra.money/icon/svg/Terra/UST.svg",
          name: "Terra USD",
          symbol: "USTC",
          token: "uusd"
        }
      ],
      tokens: [
        {
          balance: "100000000000000",
          decimals: 12,
          icon: "https://static.lido.fi/stSOL/stSOL.png",
          name: "Geminon",
          protocol: "Geminon Protocol",
          symbol: "GEX",
          token: "terra1t9ul45l7m6jw6sxgvnp8e5hj8xzkjsg82g84ap",
        }
      ]
    }


    const findTokenItem = (token: Token) => {
      const key = AccAddress.validate(token) || isDenomIBC(token) ? "tokens" : "coins"

      const option = options[key].find((item) => item.token === token)
      if (!option) throw new Error()
      return option
    }

    const findDecimals = (token: Token) => findTokenItem(token).decimals

    const calcExpected = (params: SlippageParams) => {
      const { offerAsset, askAsset, input, slippageInput, ratio } = params
      const offerDecimals = findDecimals(offerAsset)
      const askDecimals = findDecimals(askAsset)

      /* terraswap */
      const belief_price = new BigNumber(ratio)
        .dp(18, BigNumber.ROUND_DOWN)
        .toString()

      /* routeswap | on-chain */
      const max_spread = new BigNumber(slippageInput).div(100).toString()
      const amount = toAmount(input, { decimals: offerDecimals })
      const value = Number(amount) / ratio
      const minimum_receive = calcMinimumReceive(value, max_spread)

      /* expected price */
      const decimals = askDecimals - offerDecimals
      const price = toPrice(
        new BigNumber(ratio).times(new BigNumber(10).pow(decimals))
      )

      return { max_spread, belief_price, minimum_receive, price }
    }

    return { options, findTokenItem, findDecimals, calcExpected }
  }, [
    // currency,
    // bankBalance,
    // activeDenoms,
    // ibcWhitelist,
    // cw20Whitelist,
    // terraswapAvailableList,
    // cw20TokensBalances,
    // isClassic,
  ])

  /* const state = combineState(
    // ibcWhitelistState,
    // cw20WhitelistState,
    // ...cw20TokensBalancesState
  ) */
  // MOCK STATE
  const state = {
    error: undefined,
    isFetching: false,
    isIdle: false,
    isLoading: false,
    isSuccess: true
  }

  const render = () => {
    if (!context) return null
    return <SingleSwapProvider value={context}>{children}</SingleSwapProvider>
  }

  return <Card {...state}>{render()}</Card>
}



export default SingleSwapContext


/* type guard */
export const validateSlippageParams = (
  params: Partial<SlippageParams>
): params is SlippageParams => {
  const { input, slippageInput, ratio, ...assets } = params
  return !!(validateAssets(assets) && input && slippageInput && ratio)
}

/* minimum received */
export const calcMinimumReceive = (
  simulatedValue: Value,
  max_spread: string
) => {
  const minRatio = new BigNumber(1).minus(max_spread)
  const value = new BigNumber(simulatedValue).times(minRatio)
  return value.integerValue(BigNumber.ROUND_FLOOR).toString()
}




// const SingleSwapContext = ({ children }: PropsWithChildren<{}>) => {
//   const currency = useCurrency()
//   const isClassic = useIsClassic()
//   const bankBalance = useBankBalance()
//   const { activeDenoms, pairs } = useSwap()
//   const { list } = useCustomTokensCW20()
//   const customTokens = list.map(({ token }) => token)

//   /* contracts */
//   const { data: ibcWhitelist, ...ibcWhitelistState } = useIBCWhitelist()
//   const { data: cw20Whitelist, ...cw20WhitelistState } = useCW20Whitelist()

//   // Why?
//   // To search tokens with symbol (ibc, cw20)
//   // To filter tokens with balance (cw20)
//   const terraswapAvailableList = useMemo(() => {
//     if (!(ibcWhitelist && cw20Whitelist)) return

//     const terraswapAvailableList = uniq(
//       flatten(Object.values(pairs).map(({ assets }) => assets))
//     )

//     const ibc = terraswapAvailableList
//       .filter(isDenomIBC)
//       .filter((denom) => ibcWhitelist[denom.replace("ibc/", "")])

//     const cw20 = terraswapAvailableList
//       .filter(AccAddress.validate)
//       .filter((token) => cw20Whitelist[token])

//     return { ibc, cw20 }
//   }, [cw20Whitelist, ibcWhitelist, pairs])

//   // Fetch cw20 balances: only listed and added by the user
//   const cw20TokensBalanceRequired = useMemo(() => {
//     if (!terraswapAvailableList) return []
//     return customTokens.filter((token) =>
//       terraswapAvailableList.cw20.includes(token)
//     )
//   }, [customTokens, terraswapAvailableList])

//   const cw20TokensBalancesState = useTokenBalances(cw20TokensBalanceRequired)
//   const cw20TokensBalances = useMemo(() => {
//     if (cw20TokensBalancesState.some(({ isSuccess }) => !isSuccess)) return

//     return zipObj(
//       cw20TokensBalanceRequired,
//       cw20TokensBalancesState.map(({ data }) => {
//         if (!data) throw new Error()
//         return data
//       })
//     )
//   }, [cw20TokensBalanceRequired, cw20TokensBalancesState])

//   const context = useMemo(() => {
//     if (!(terraswapAvailableList && ibcWhitelist && cw20Whitelist)) return
//     if (!cw20TokensBalances) return

//     const coins = sortDenoms(activeDenoms, currency).map((denom) => {
//       const balance = getAmount(bankBalance, denom)
//       return { ...readNativeDenom(denom, isClassic), balance }
//     })

//     const ibc = terraswapAvailableList.ibc.map((denom) => {
//       const item = ibcWhitelist[denom.replace("ibc/", "")]
//       const balance = getAmount(bankBalance, denom)
//       return { ...readIBCDenom(item), balance }
//     })

//     const cw20 = terraswapAvailableList.cw20.map((token) => {
//       const balance = cw20TokensBalances[token] ?? "0"
//       return { ...cw20Whitelist[token], balance }
//     })

//     const options = { coins, tokens: [...ibc, ...cw20] }

//     const findTokenItem = (token: Token) => {
//       const key = AccAddress.validate(token) || isDenomIBC(token) ? "tokens" : "coins"

//       const option = options[key].find((item) => item.token === token)
//       if (!option) throw new Error()
//       return option
//     }

//     const findDecimals = (token: Token) => findTokenItem(token).decimals

//     const calcExpected = (params: SlippageParams) => {
//       const { offerAsset, askAsset, input, slippageInput, ratio } = params
//       const offerDecimals = findDecimals(offerAsset)
//       const askDecimals = findDecimals(askAsset)

//       /* terraswap */
//       const belief_price = new BigNumber(ratio)
//         .dp(18, BigNumber.ROUND_DOWN)
//         .toString()

//       /* routeswap | on-chain */
//       const max_spread = new BigNumber(slippageInput).div(100).toString()
//       const amount = toAmount(input, { decimals: offerDecimals })
//       const value = Number(amount) / ratio
//       const minimum_receive = calcMinimumReceive(value, max_spread)

//       /* expected price */
//       const decimals = askDecimals - offerDecimals
//       const price = toPrice(
//         new BigNumber(ratio).times(new BigNumber(10).pow(decimals))
//       )

//       return { max_spread, belief_price, minimum_receive, price }
//     }

//     return { options, findTokenItem, findDecimals, calcExpected }
//   }, [
//     currency,
//     bankBalance,
//     activeDenoms,
//     ibcWhitelist,
//     cw20Whitelist,
//     terraswapAvailableList,
//     cw20TokensBalances,
//     isClassic,
//   ])

//   const state = combineState(
//     ibcWhitelistState,
//     cw20WhitelistState,
//     ...cw20TokensBalancesState
//   )

//   const render = () => {
//     if (!context) return null
//     return <SingleSwapProvider value={context}>{children}</SingleSwapProvider>
//   }

//   return <Card {...state}>{render()}</Card>
// }



