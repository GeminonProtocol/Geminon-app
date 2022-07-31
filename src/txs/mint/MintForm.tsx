import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
// import { useLocation } from "react-router-dom"
// import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import { useNetwork, useAccount, useBalance, useContractReads, erc20ABI } from 'wagmi'
// import { ethers } from "ethers"
// import BigNumber from "bignumber.js"
// import { AccAddress } from "@terra-money/terra.js"
// import { isDenomTerra } from "@terra.kitchen/utils"
// import { toAmount } from "@terra.kitchen/utils"

/* helpers */
import { has } from "utils/num"
import BigNumber from "bignumber.js"
// import { getAmount, sortCoins } from "utils/coin"
// import { queryKey } from "data/query"
// import { useAddress } from "data/wallet"
// import { useBankBalance } from "data/queries/bank"
// import { useCustomTokensCW20 } from "data/settings/CustomTokens"

/* components */
import { Form, FormArrow, FormError } from "components/form"
import { Checkbox, RadioButton } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Txm from "../Txm"

/* swap modules */
import AssetFormItem from "../swap/components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "../swap/components/AssetFormItem"
import SelectToken from "../swap/components/SelectToken"
import SlippageControl from "../swap/components/SlippageControl"
import ExpectedPrice, { ExpectedPriceProps } from "../swap/components/ExpectedPrice"
// import useSwapUtils, { validateAssets } from "./useSwapUtils"
import { SwapMode, validateParams } from "../swap/useSwapUtils"
import { SlippageParams } from "../swap/SingleSwapContext"
// import { validateSlippageParams, useSingleSwap } from "./SingleSwapContext"
// import styles from "./SwapForm.module.scss"

/* Token images */
import gexIcon from "../../styles/images/tokens/gex.png"
import usdiIcon from "../../styles/images/tokens/usdi.png"

/* Smart contracts */
import gexDeploy from "../../config/contracts/GEX.json"
import usdiDeploy from "../../config/contracts/USDI.json"
import scminterDeploy from "../../config/contracts/SCMinter.json"
import oracleDeploy from "../../config/contracts/GeminonOracle.json"


// import { Coins } from "@terra-money/terra.js"



export const contractsInfo = {
  tokens: {
    gex: gexDeploy,
    usdi: usdiDeploy,
  },
  minter: scminterDeploy,
  oracle: oracleDeploy,
}


const defaultDecimals = 18

export const tokensList: ERC20Token[] = [
  {
    balance: "0",
    decimals: defaultDecimals,
    icon: gexIcon,
    name: "Geminon",
    symbol: "GEX",
    token: contractsInfo.tokens.gex.address,
    address: contractsInfo.tokens.gex.address,
  },
  {
    balance: "0",
    decimals: defaultDecimals,
    icon: usdiIcon,
    name: "Inflation Indexed Dollar",
    symbol: "USDI",
    token: contractsInfo.tokens.usdi.address,
    address: contractsInfo.tokens.usdi.address,
  },
]


const useReadBalances = () => {
  const { address, isConnected } = useAccount()
  const contracts = tokensList.map((asset) => {
    return {
      addressOrName: asset.address,
      contractInterface: erc20ABI,
      functionName: "balanceOf",
      args: address,    
    }
  })
  
  const { data: tokenData } = useContractReads({ contracts, enabled: isConnected })
  
  tokensList.forEach((asset, index) => {
    asset.balance = tokenData?.[index]?.toString() ?? "0"
  })
  
  return tokensList
}

export const useTokenInfo = (tokenSymbol: string) => {
  const { chain } = useNetwork()
  const connectedNetworkId = chain?.id.toString()
  
  const deployInfo = contractsInfo.tokens
  const key = tokenSymbol.toLowerCase() as keyof typeof deployInfo

  let isError = false
  if (deployInfo?.[key].network != connectedNetworkId) {
    console.log("[useTokenInfo] Network mismatch")
    isError = true
  }
  console.log("[useTokenInfo] address", deployInfo[key].address)
  return { 
    scAddress: deployInfo[key].address, 
    scAbi: deployInfo[key].abi, 
    isError: isError 
  }
}

const useMinterInfo = (offerAsset:string|undefined, offerAmount:string, 
  stablecoinSymbol:string, enabled:boolean) => {
  const { isConnected } = useAccount()
  const { scAddress, scAbi } = useTokenInfo(stablecoinSymbol)
  console.log("[useMinterInfo] params:", offerAsset, offerAmount)
  
  const contracts = offerAsset === "GEX" ? 
  [
    {
      addressOrName: contractsInfo.minter.address,
      contractInterface: contractsInfo.minter.abi,
      functionName: "calculateRedeemAmount",
      args: [scAddress, offerAmount], 
      
    },
    {
      addressOrName: contractsInfo.oracle.address,
      contractInterface: contractsInfo.oracle.abi,
      functionName: "getPrice",
    },
    {
      addressOrName: scAddress,
      contractInterface: scAbi,
      functionName: "getPegValue",
    }
  ] : [
    {
      addressOrName: contractsInfo.minter.address,
      contractInterface: contractsInfo.minter.abi,
      functionName: "calculateMintAmount",
      args: [scAddress, offerAmount], 
    },
    {
      addressOrName: scAddress,
      contractInterface: scAbi,
      functionName: "getPegValue",
    },
    {
      addressOrName: contractsInfo.oracle.address,
      contractInterface: contractsInfo.oracle.abi,
      functionName: "getPrice",
    },
  ]
  
  const { data, status } = useContractReads({ 
    contracts, 
    enabled: isConnected && enabled 
  })
  console.log("[useMinterInfo] Contract Read. status, data:", status, data)
  
  // All amounts numbers as string in wei units (1e18)
  return { 
    outAmount: data?.[0]?.toString(),
    offerAssetPrice: data?.[1]?.toString(),
    askAssetPrice: data?.[2]?.toString(),
  }
}


const useMintFees = (offerAsset:string|undefined, 
  gexAmount:string|undefined, enabled:boolean) => {
  const { isConnected } = useAccount()

  const { address, abi } = contractsInfo.minter
  console.log("[useMintFees] Minter address", address)
  
  const contracts = offerAsset === "GEX" ?
  [
    {
      addressOrName: address,
      contractInterface: abi,
      functionName: "amountRedeemFee",
      args: gexAmount, 
      
    },
    {
      addressOrName: address,
      contractInterface: abi,
      functionName: "getFee",
      args: [gexAmount, 2000], 
    },
  ] : [
    {
      addressOrName: address,
      contractInterface: abi,
      functionName: "amountMintFee",
      args: gexAmount, 
    },
    {
      addressOrName: address,
      contractInterface: abi,
      functionName: "getFee",
      args: [gexAmount, 1000], 
    },
  ]
  
  console.log("[usePoolFees] Contracts config:", contracts)
  const { data, ...status } = useContractReads({ 
    contracts,
    enabled: enabled && isConnected 
  })
  console.log("[usePoolFees] Contracts read, status:", data, status)
  if (status.error) console.log("[usePoolFees] Contract read ERROR:", data, status.error)
  
  return { 
    feeAmount: data?.[0]?.toString(),  // Number as string in wei units (1e18)
    feePerc: data?.[1]?.toString(),  // Number as string in 1e6 units
  }
}




interface TxValues extends Partial<SlippageParams> {
  mode?: SwapMode
}

const MintForm = () => {
  console.log("[MINTFORM] START")
  const { t } = useTranslation()
  const { isConnected } = useAccount()

  // BALANCES
  const assetsList: TokenItemWithBalance[] = useReadBalances()

    
  // MUESTRA LA LISTA DE TOKENS EN EL FORMULARIO
  const [showAll, setShowAll] = useState(false)

  const getCoinsOptions = (key: "offerAsset" | "askAsset") => {
    return [{ 
      title: t("Coins"), 
      children: assetsList.map((asset) => {
        const { symbol: value, balance } = asset

        // Sombrear en la lista, si hay un activo seleccionado en el otro
        // formulario, diferente a GEX, todas las opciones que no sean GEX 
        const muted = { 
          offerAsset: !!askAsset && (askAsset!="GEX" && value!="GEX") || (askAsset==value),
          askAsset: !!offerAsset && (offerAsset!="GEX" && value!="GEX") || (offerAsset==value)
        }[key]

        const hidden = key === "offerAsset" && !showAll && !has(balance) && isConnected
        
        return { ...asset, value, muted, hidden }
      })
   }]
  }


  // FORM
  const form = useForm<TxValues>({
    mode: "onChange", // what triggers validation of form inputs. onChange is expensive. Alt: onSubmit
    defaultValues: { offerAsset: "GEX", askAsset: "USDI", slippageInput: 1 },
  })

  const { register, trigger, watch, setValue, resetField, handleSubmit, reset, formState } = form
  const { errors } = formState
  const values = watch()
  const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values // Esta desestructuración viene definida por el interfaz TxValues
  
  if (Number.isNaN(input)) resetField("input")  // A veces aparece un NaN, causa desconocida.


  const assets = useMemo(
    () => ({ offerAsset, askAsset }),
    [offerAsset, askAsset]
  )

  const slippageParams = useMemo(
    () => ({ offerAsset, askAsset, input, slippageInput, ratio }),
    [askAsset, input, offerAsset, ratio, slippageInput]
  )

  const findAssetBySymbol = (symbol: string) => assetsList.find((item) => item.symbol === symbol)
  const findAssetDecimalsBySymbol = (symbol: string) => findAssetBySymbol(symbol)?.decimals ?? defaultDecimals
  
  const offerTokenItem = offerAsset ? findAssetBySymbol(offerAsset) : undefined
  const offerDecimals = offerAsset ? findAssetDecimalsBySymbol(offerAsset) : defaultDecimals
  const askTokenItem = askAsset ? findAssetBySymbol(askAsset) : undefined
  const askDecimals = askAsset ? findAssetDecimalsBySymbol(askAsset) : defaultDecimals

  const inAmount = new BigNumber(input ?? 0).shiftedBy(offerDecimals).toFixed()
  
  
  // Change assets position in the form
  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
    resetField("input")
  }



  // FETCH SWAP ESTIMATES
  const enableHooks = isConnected && !!offerAsset && !!askAsset && !!input 
  if (!enableHooks) console.log("[MINTFORM] Hooks DISABLED: symbols, input", offerAsset, askAsset, input)

  const tradeInfo = useMinterInfo(offerAsset, inAmount, askAsset ?? "USDI", enableHooks)
  const { outAmount, offerAssetPrice, askAssetPrice } = tradeInfo
  console.log("[MINTFORM] Tradeinfo:", tradeInfo)

  const gexAmount = offerAsset == "GEX" ?
    inAmount :
    askAsset == "GEX" ?
    outAmount :
    "0"
  const { feeAmount, feePerc } = useMintFees(offerAsset, gexAmount, enableHooks)
  console.log("[MINTFORM] Fees:", feeAmount, feePerc)
  

  

  // Handle select asset on form
  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (value: Token) => {
      const assets = {
        offerAsset: { offerAsset: value, askAsset },
        askAsset: { offerAsset, askAsset: value },
      }[key]

      // Enforce swap always against GEX
      if (value != "GEX") {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", "GEX")
      }
      // empty opposite asset if select the same asset
      else if (assets.offerAsset === assets.askAsset) {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
      }
      
      // focus on input if select offer asset
      if (key === "offerAsset") {
        form.resetField("input")
        form.setFocus("input") // Pone el cursor para escribir en el formulario 1. Como hacer click.
      }

      setValue(key, value)
    }
  }


  // tx
  const balance = offerTokenItem?.balance
  
  // Callback que se pasa a TX, está desactivado allí
  const createTx = () => undefined

  // fee
  // Valores que se pasan al callback createTx en Tx
  const estimationTxValues = {
    mode, 
    ...assets,
    ratio: 10, 
    input: toInput(balance ?? "", findAssetDecimalsBySymbol(offerAsset ?? "")), 
    slippageInput: 1
  }

  // PARÁMETROS QUE SE PASAN AL COMPONENTE TX
  const txProps = {
    symbol: offerAsset,
    scSymbol: askAsset, 
    decimals: offerDecimals,
    balance: offerTokenItem?.balance,
    inAmount,
    outAmount,
    feePerc,
    resetForm: () => reset()
  }
  const initialGasDenom = ""
  const token = offerAsset
  const symbol = offerTokenItem?.symbol ?? ""
  const decimals = offerDecimals
  const tx = {
    newProps: txProps,
    token: offerAsset,
    symbol,
    decimals,
    amount: inAmount,
    balance,
    initialGasDenom,
    estimationTxValues, // Valores que se pasan a createTx
    createTx, // No se usa de momento, lo tenemos desactivado en Tx
    onPost: () => {} // Función para añadir token personalizado al wallet tras comprarlo -> implementar,
  }


  const disabled = false //isFetching ? t("Simulating...") : false



  // RENDER FUNCTIONS
  const isFetching = false

  // type guard
  const validateExpectedPriceProps = (
    params: Partial<ExpectedPriceProps>
    ): params is ExpectedPriceProps => {
      const { offerAsset, askAsset, offerAssetPrice, askAssetPrice, 
        feeAmount, minimum_receive } = params
      return !!(offerAsset && askAsset && offerAssetPrice && 
        askAssetPrice && feeAmount && minimum_receive)
    }

  // render: expected price
  const renderExpected = () => {
    if (!input) return null

    const minimum_receive = outAmount
    const isLoading = false
    const props = { offerAsset, offerDecimals, askAsset, askDecimals, 
      offerAssetPrice, feeAmount, minimum_receive, isLoading, mode:"SCMint"}

    if (!(isConnected && validateExpectedPriceProps(props))){
      console.log("[MINTFORM][renderExpected] props NOT VALIDATED", props)
      return null
    } 
    // (7-10) DATOS DEBAJO DEL PAR, APARECEN SOLO
    // SI SE INTRODUCE UNA CANTIDAD ARRIBA PARA CAMBIAR
    console.log("[MINTFORM][renderExpected] props VALIDATED", props)
    return <ExpectedPrice {...props} isLoading={isFetching} />
  }

    

  return (
    <Txm {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {/* (1) PESTAÑAS MERCADOS SWAP */}
          {/* {renderRadioGroup()} */}
        
          {/* (3) PRIMER FORMULARIO TOKEN */}
          <AssetFormItem
            label={t("From")}
            extra={max.render(async (value) => {// (2) BALANCE TOKEN 1 (MÁXIMO GASTABLE)
              // Do not use automatic max here
              // Confusion arises as the amount changes and simulates again
              setValue("input", toInput(value, offerDecimals))
              await trigger("input")
            })}
            error={errors.input?.message}
          >
            <SelectToken
              value={offerAsset}
              onChange={onSelectAsset("offerAsset")}
              options={getCoinsOptions("offerAsset")}
              checkbox={
                <Checkbox
                  checked={showAll}
                  onChange={() => setShowAll(!showAll)}
                >
                  {t("Show all")}
                </Checkbox>
              }
              addonAfter={
                <AssetInput
                  {...register("input", {
                    valueAsNumber: true,
                    validate: validate.input(
                      toInput(max.amount, offerDecimals),
                      offerDecimals
                    ),
                  })}
                  inputMode="decimal"
                  placeholder={"0.000"}
                  onFocus={max.reset}
                  autoFocus
                />
              }
            />
          </AssetFormItem>

          {/* (4) FLECHA INVERTIR SWAP */}
          <FormArrow onClick={swapAssets} />

          {/* (5) SEGUNDO FORMULARIO TOKEN */}
          <AssetFormItem label={t("To")}>
            <SelectToken
              value={askAsset}
              onChange={onSelectAsset("askAsset")}
              options={getCoinsOptions("askAsset")}
              addonAfter={
                <AssetReadOnly>
                  {outAmount ? (
                    <Read
                    // TODO: Descontar fees del importe de salida mostrado
                      amount={outAmount}
                      decimals={askDecimals}
                      approx
                    />
                  ) : (
                    <p className="muted">
                      {isFetching ? t("Simulating...") : "0"}
                    </p>
                  )}
                </AssetReadOnly>
              }
            />
          </AssetFormItem>

          {/* (7-10) DATOS RESULTADO SWAP */}
          {renderExpected()}
          
          {/* (11) DETALLES FEE. COMPONENTE renderFee() DE Tx */}
          {isConnected && fee.render()}

          {/* {( Banner rojo error parte inferior caja
            <FormError>{t("Pair does not exist")}</FormError>
          )} */}

          {/* (12) BOTÓN ENVIAR TRANSACCIÓN */}
          {submit.button}
        </Form>
      )}
    </Txm>
  )
}


export default MintForm




// const SwapForm = () => {
//   const { t } = useTranslation()
//   const address = useAddress()
//   const { state } = useLocation()
//   const bankBalance = useBankBalance()
//   const { add } = useCustomTokensCW20()

//   // swap context
//   const utils = useSwapUtils()
//   const { getIsSwapAvailable, getAvailableSwapModes } = utils
//   const { getMsgsFunction, getSimulateFunction, getSimulateQuery } = utils
//   const { options, findTokenItem, findDecimals, calcExpected } = useSingleSwap()

//   const initialOfferAsset =
//     (state as Token) ??
//     (getAmount(bankBalance, "uusd") ? "uusd" : sortCoins(bankBalance)[0].denom)
//   const initialGasDenom = getInitialGasDenom(bankBalance)

//   // options
//   const [showAll, setShowAll] = useState(false)

//   const getCoinsOptions = (key: "offerAsset" | "askAsset") => {
//     const { coins, tokens } = options

//     const getOptionList = (list: TokenItemWithBalance[]) =>
//       list.map((item) => {
//         const { token: value, balance } = item

//         const muted = {
//           offerAsset:
//             !!askAsset && !getIsSwapAvailable({ offerAsset: value, askAsset }),
//           askAsset:
//             !!offerAsset &&
//             !getIsSwapAvailable({ offerAsset, askAsset: value }),
//         }[key]

//         const hidden = key === "offerAsset" && !showAll && !has(balance)
//         return { ...item, value, muted, hidden }
//       })

//     return [
//       { title: t("Coins"), children: getOptionList(coins) },
//       { title: t("Tokens"), children: getOptionList(tokens) },
//     ]
//   }

//   // form
//   const form = useForm<TxValues>({
//     mode: "onChange",
//     defaultValues: { offerAsset: initialOfferAsset, slippageInput: 1 },
//   })

//   const { register, trigger, watch, setValue, handleSubmit, formState } = form
//   const { errors } = formState
//   const values = watch()
//   const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values

//   useEffect(() => {
//     // validate input on change mode
//     if (mode) trigger("input")
//   }, [mode, trigger])

//   const assets = useMemo(
//     () => ({ offerAsset, askAsset }),
//     [offerAsset, askAsset]
//   )

//   const slippageParams = useMemo(
//     () => ({ offerAsset, askAsset, input, slippageInput, ratio }),
//     [askAsset, input, offerAsset, ratio, slippageInput]
//   )

//   const offerTokenItem = offerAsset ? findTokenItem(offerAsset) : undefined
//   const offerDecimals = offerAsset ? findDecimals(offerAsset) : undefined
//   const askTokenItem = askAsset ? findTokenItem(askAsset) : undefined
//   const askDecimals = askAsset ? findDecimals(askAsset) : undefined

//   const amount = toAmount(input, { decimals: offerDecimals })

//   const swapAssets = () => {
//     setValue("offerAsset", askAsset)
//     setValue("askAsset", offerAsset)
//     setValue("input", undefined)
//     trigger("input")
//   }

//   // simulate | execute
//   const params = { amount, ...assets }
//   const availableSwapModes = getAvailableSwapModes(assets)
//   const isSwapAvailable = getIsSwapAvailable(assets)
//   const simulateQuery = getSimulateQuery(params)

//   // simulate
//   const { data: simulationResults, isFetching } = useQuery({
//     ...simulateQuery,
//     onSuccess: ({ profitable }) => setValue("mode", profitable?.mode),
//   })

//   // Simulated value to create tx
//   // Simulated for all possible modes
//   // Do not simulate again even if the mode changes
//   const results = simulationResults?.values
//   const result = results && mode && results[mode]
//   const simulatedValue = result?.value
//   const simulatedRatio = result?.ratio

//   useEffect(() => {
//     // Set ratio on simulate
//     if (simulatedRatio) setValue("ratio", simulatedRatio)
//   }, [simulatedRatio, setValue])

//   // Select asset
//   const onSelectAsset = (key: "offerAsset" | "askAsset") => {
//     return async (value: Token) => {
//       const assets = {
//         offerAsset: { offerAsset: value, askAsset },
//         askAsset: { offerAsset, askAsset: value },
//       }[key]

//       // set mode if only one available
//       const availableSwapModes = getAvailableSwapModes(assets)
//       const availableSwapMode =
//         availableSwapModes?.length === 1 ? availableSwapModes[0] : undefined
//       setValue("mode", availableSwapMode)

//       // empty opposite asset if select the same asset
//       if (assets.offerAsset === assets.askAsset) {
//         setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
//       }

//       // focus on input if select offer asset
//       if (key === "offerAsset") {
//         form.resetField("input")
//         form.setFocus("input")
//       }

//       setValue(key, value)
//     }
//   }

//   // tx
//   const balance = offerTokenItem?.balance
//   const createTx = useCallback(
//     (values: TxValues) => {
//       const { mode, offerAsset, askAsset, input, slippageInput, ratio } = values
//       if (!(mode && input && offerAsset && askAsset && slippageInput && ratio))
//         return

//       const offerDecimals = findDecimals(offerAsset)
//       const amount = toAmount(input, { decimals: offerDecimals })
//       if (!balance || new BigNumber(amount).gt(balance)) return

//       const params = { amount, offerAsset, askAsset }
//       if (!validateParams(params)) return

//       const getMsgs = getMsgsFunction(mode)

//       // slippage 
//       const expected = calcExpected({ ...params, input, slippageInput, ratio })
//       return { msgs: getMsgs({ ...params, ...expected }) }
//     },
//     [balance, calcExpected, findDecimals, getMsgsFunction]
//   )

//   // fee
//   const { data: estimationTxValues } = useQuery(
//     ["estimationTxValues", { mode, assets, balance }],
//     async () => {
//       if (!(mode && validateAssets(assets) && balance)) return
//       const { offerAsset, askAsset } = assets
//       const simulate = getSimulateFunction(mode)
//       // estimate fee only after ratio simulated
//       const { ratio } = await simulate({ ...assets, amount: balance })
//       const input = toInput(balance, findDecimals(offerAsset))
//       return { mode, offerAsset, askAsset, ratio, input, slippageInput: 1 }
//     }
//   )

//   const token = offerAsset
//   const decimals = offerDecimals
//   const tx = {
//     token,
//     decimals,
//     amount,
//     balance,
//     initialGasDenom,
//     estimationTxValues,
//     createTx,
//     onPost: () => {
//       // add custom token on ask cw20
//       if (!(askAsset && AccAddress.validate(askAsset) && askTokenItem)) return
//       const { balance, ...rest } = askTokenItem
//       add(rest as CustomTokenCW20)
//     },
//     queryKeys: [offerAsset, askAsset]
//       .filter((asset) => asset && AccAddress.validate(asset))
//       .map((token) => [
//         queryKey.wasm.contractQuery,
//         token,
//         { balance: address },
//       ]),
//   }

//   const disabled = isFetching ? t("Simulating...") : false

//   // render
//   const renderRadioGroup = () => {
//     if (!(validateAssets(assets) && isSwapAvailable)) return null

//     return (
//       <section className={styles.modes}>
//         {availableSwapModes.map((key) => {
//           const checked = mode === key

//           return (
//             <RadioButton
//               {...register("mode")}
//               value={key}
//               checked={checked}
//               key={key}
//             >
//               {key}
//             </RadioButton>
//           )
//         })}
//       </section>
//     )
//   }

//   // render: expected price
//   const renderExpected = () => {
//     if (!(mode && validateSlippageParams(slippageParams))) return null
//     const expected = calcExpected(slippageParams)
//     const props = { mode, ...slippageParams, ...expected, ...result }
//     return <ExpectedPrice {...props} isLoading={isFetching} />
//   }

//   const slippageDisabled = [offerAsset, askAsset].every(isDenomTerra)

//   return (
//     <Tx {...tx} disabled={disabled}>
//       {({ max, fee, submit }) => (
//         <Form onSubmit={handleSubmit(submit.fn)}>
//           {renderRadioGroup()}

//           <AssetFormItem
//             label={t("From")}
//             extra={max.render(async (value) => {
//               // Do not use automatic max here
//               // Confusion arises as the amount changes and simulates again
//               setValue("input", toInput(value, offerDecimals))
//               await trigger("input")
//             })}
//             error={errors.input?.message}
//           >
//             <SelectToken
//               value={offerAsset}
//               onChange={onSelectAsset("offerAsset")}
//               options={getCoinsOptions("offerAsset")}
//               checkbox={
//                 <Checkbox
//                   checked={showAll}
//                   onChange={() => setShowAll(!showAll)}
//                 >
//                   {t("Show all")}
//                 </Checkbox>
//               }
//               addonAfter={
//                 <AssetInput
//                   {...register("input", {
//                     valueAsNumber: true,
//                     validate: validate.input(
//                       toInput(max.amount, offerDecimals),
//                       offerDecimals
//                     ),
//                   })}
//                   inputMode="decimal"
//                   placeholder={getPlaceholder(offerDecimals)}
//                   onFocus={max.reset}
//                   autoFocus
//                 />
//               }
//             />
//           </AssetFormItem>

//           <FormArrow onClick={swapAssets} />

//           <AssetFormItem label={t("To")}>
//             <SelectToken
//               value={askAsset}
//               onChange={onSelectAsset("askAsset")}
//               options={getCoinsOptions("askAsset")}
//               addonAfter={
//                 <AssetReadOnly>
//                   {simulatedValue ? (
//                     <Read
//                       amount={simulatedValue}
//                       decimals={askDecimals}
//                       approx
//                     />
//                   ) : (
//                     <p className="muted">
//                       {isFetching ? t("Simulating...") : "0"}
//                     </p>
//                   )}
//                 </AssetReadOnly>
//               }
//             />
//           </AssetFormItem>

//           {!slippageDisabled && (
//             <SlippageControl
//               {...register("slippageInput", {
//                 valueAsNumber: true,
//                 validate: validate.input(50, 2, "Slippage tolerance"),
//               })}
//               input={slippageInput} // to warn
//               inputMode="decimal"
//               placeholder={getPlaceholder(2)}
//               error={errors.slippageInput?.message}
//             />
//           )}

//           {renderExpected()}
//           {fee.render()}

//           {validateAssets(assets) && !isSwapAvailable && (
//             <FormError>{t("Pair does not exist")}</FormError>
//           )}

//           {submit.button}
//         </Form>
//       )}
//     </Tx>
//   )
// }