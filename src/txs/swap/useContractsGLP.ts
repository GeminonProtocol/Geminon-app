import BigNumber from "bignumber.js"

import { useNetwork, useAccount, useBalance, useContractRead, useContractReads, erc20ABI } from 'wagmi'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'

// import { combineState } from "data/query"

import { getPoolContracts } from "config/contracts.js"
import { defaultNetworkID } from "config/networks"



export const useReadBalances = (nativeAsset: AssetEVM, tokensList: TokenEVM[]) => {
  // console.log("[useReadBalances] nativeAsset, tokensList", nativeAsset, tokensList)
  const { address, isConnected } = useAccount()

  const contracts = tokensList.map((asset) => {
    return {
      addressOrName: asset.address,
      contractInterface: erc20ABI,
      functionName: "balanceOf",
      args: address,
      enabled: isConnected
    }
  })
  
  const { data: coinData, refetch: refetchNative } = useBalance({addressOrName: address, formatUnits: 'wei'})
  const { data: tokenData, refetch: refetchTokens } = useContractReads({ contracts })
  
  const poolNative: PoolAsset = {
    ...nativeAsset, 
    balance: coinData?.formatted ?? "0"
  }

  const tokensPool: PoolAsset[] = tokensList.map((asset, index) => {
    // console.log("[useReadBalances] asset / balance", asset.symbol, new BigNumber(tokenData?.[index]?.toString() ?? "0").shiftedBy(18-asset.uwdecimals).toFixed(0))
    return {
      ...asset, 
      balance: new BigNumber(tokenData?.[index]?.toString() ?? "0").shiftedBy(18-asset.uwdecimals).toFixed(0)
    }
  })
  
  const assetsList = [poolNative, ...tokensPool]

  // console.log("[useReadBalances] assetsList", assetsList)

  return {assetsList, refetchNative, refetchTokens}
}


export const usePoolSymbol = (offerAsset: AssetEVM, askAsset: AssetEVM) => {
  return offerAsset.key == "gex" ? askAsset.key : offerAsset.key
}


const usePoolContractInfo = (poolSymbol: string) => {
  const { chain } = useNetwork()
  const connectedNetworkId = chain?.id.toString() ?? defaultNetworkID
  
  const networkPools = getPoolContracts(connectedNetworkId)
  let key = poolSymbol.toLowerCase() as keyof typeof networkPools
  if (!(key in networkPools)) key = Object.keys(networkPools)[0]
  
  return { 
    poolAddress: networkPools[key].address, 
    abi: networkPools[key].abi, 
  }
}

export const usePoolInfo = (poolSymbol:string, offerSymbol:string, offerAmount:string, enabled:boolean) => {
  // console.log("[usePoolInfo] poolSymbol, offerSymbol, offerAmount, enabled:", poolSymbol, offerSymbol, offerAmount, enabled)  
  const { isConnected } = useAccount()
  const { poolAddress, abi } = usePoolContractInfo(poolSymbol)

  const contract = offerSymbol === "GEX" ? 
  {
    addressOrName: poolAddress,
    contractInterface: abi,
    functionName: "getRedeemInfo",
    args: offerAmount,
    enabled: isConnected && enabled
  } : {
    addressOrName: poolAddress,
    contractInterface: abi,
    functionName: "getMintInfo",
    args: offerAmount,
    enabled: isConnected && enabled
  }
  /**
  uint256 collateralPriceUSD, 0
  uint256 initGEXPriceUSD, 1
  uint256 collatQuote, 2
  uint256 gexQuote, 3
  uint256 fee, 4
  uint256 feeAmount, 5
  uint256 outCollatAmount, 6
  uint256 finalGEXPriceUSD, 7
  uint256 priceImpact 8
  */
  const { data, refetch, ...status } = useContractRead(contract)
  // console.log("[usePoolInfo] status, contract Read:", status, data)
  // if (status.error) // console.log("[usePoolInfo] Contract read ERROR:", data, status.error)

  const prices = offerSymbol === "GEX" ? 
  {
    askAssetPrice: data?.[0].toString(),
    offerAssetPrice: data?.[1].toString(),
    askAssetRatio: data?.[2].toString(),
    offerAssetRatio: data?.[3].toString(),
  } : {
    offerAssetPrice: data?.[0].toString(),
    askAssetPrice: data?.[1].toString(),
    offerAssetRatio: data?.[2].toString(),
    askAssetRatio: data?.[3].toString(),
  }

  return { 
    ...prices,
    feePerc: data?.[4].toString(),  // Number as string in 1e6 units
    feeAmount: data?.[5].toString(),
    outAmount: data?.[6].toString(),
    priceImpact: data?.[8].toString()
  }
}



// const usePoolTradeInfo = (poolSymbol:string, offerSymbol:string, offerAmount:string, enabled:boolean) => {
//   // console.log("[usePoolTradeInfo] poolSymbol, offerSymbol, offerAmount, enabled:", poolSymbol, offerSymbol, offerAmount, enabled)  
//   const { isConnected } = useAccount()
//   const { poolAddress, abi } = usePoolContractInfo(poolSymbol)

//   const contracts = offerSymbol === "GEX" ?
//   [
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getOutCollateralAmount",
//       args: offerAmount, 
      
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getGEXPrice",
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getCollateralPrice",
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getCollateralQuote",
//     },
//   ] : [
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getOutGEXAmount",
//       args: offerAmount, 
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getCollateralPrice",
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getGEXPrice",
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getGEXQuote",
//     },
//   ]
    
//   const { data } = useContractReads({ 
//     contracts,
//     enabled: enabled && isConnected 
//     })
//   // console.log("[usePoolTradeInfo] Contract Read:", data)
  
//   // All amounts numbers as string in wei units (1e18)
//   return { 
//     outAmount: data?.[0]?.toString(),
//     offerAssetPrice: data?.[1]?.toString(),
//     askAssetPrice: data?.[2]?.toString(),
//     askAssetRatio: data?.[3]?.toString(),
//   }
// }


// const usePoolFees = (poolSymbol:string, offerSymbol:string, gexAmount:string) => {
//   // console.log("[usePoolFees] poolSymbol, offerSymbol, gexAmount:", poolSymbol, offerSymbol, gexAmount)  
//   const { isConnected } = useAccount()
//   const { poolAddress, abi } = usePoolContractInfo(poolSymbol)
  
//   const contracts = offerSymbol === "GEX" ?
//   [
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "amountRedeemFee",
//       args: gexAmount, 
//       enabled: isConnected
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getFee",
//       args: [gexAmount, 2000], 
//       enabled: isConnected
//     },
//   ] : [
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "amountMintFee",
//       args: gexAmount, 
//       enabled: isConnected
//     },
//     {
//       addressOrName: poolAddress,
//       contractInterface: abi,
//       functionName: "getFee",
//       args: [gexAmount, 1000], 
//       enabled: isConnected
//     },
//   ]
  
//   const { data, ...status } = useContractReads({ contracts })
//   if (status.error) // console.log("[usePoolFees] Contract read ERROR:", data, status.error)
  
//   return { 
//     feeAmount: data?.[0]?.toString(),  // Number as string in wei units (1e18)
//     feePerc: data?.[1]?.toString(),  // Number as string in 1e6 units
//   }
// }


export const useFetchAllowance = (tokenAddress:string, poolSymbol:string, enabled:boolean) => {
  // console.log("[useFetchAllowance] tokenAddress, pool, enabled:", tokenAddress, poolSymbol, enabled)
  const { address, isConnected } = useAccount()
  const { poolAddress } = usePoolContractInfo(poolSymbol)
  
  const contract = {
      addressOrName: tokenAddress ?? "",
      contractInterface: erc20ABI,
      functionName: "allowance",
      args: [address, poolAddress],
      enabled: isConnected && enabled && !!tokenAddress
    }
  
  const { data, refetch, ...status } = useContractRead(contract)
  // console.log("[useFetchAllowance] allowedAmount, status:", data, status)
  
  return {allowedAmount: data?.toString(), refetchAllowance: refetch}
}
  
  
export const useInfiniteApprove = (tokenAddress:string, poolSymbol:string, enabled:boolean) => {
  // console.log("[useInfiniteApprove] tokenAddress, poolSymbol, enabled:", tokenAddress, poolSymbol, enabled)  
  const { isConnected } = useAccount()
  const { poolAddress } = usePoolContractInfo(poolSymbol)

  const maxUint256 = new BigNumber(2).exponentiatedBy(256).minus(1).toFixed()
  
  const contract = {
    // mode: 'recklesslyUnprepared' as 'recklesslyUnprepared',
    addressOrName: tokenAddress,
    contractInterface: erc20ABI,
    functionName: "approve",
    args: [poolAddress, maxUint256],
    enabled: isConnected && enabled
  }
  
  const { config, ...prepareState } = usePrepareContractWrite(contract)
  // if (prepareState.error) // console.log("[useInfiniteApprove] Prepare contract ERROR:", prepareState.error)
  
  const { data, write, ...writeState } = useContractWrite(config)
  
  const { ...waitState } = useWaitForTransaction({ 
    hash: data?.hash,
    confirmations: 1, 
  })
  
  const state = combineState(writeState, waitState)
  // console.log("[useInfiniteApprove] Combined state, enabled:", state, enabled)

  return { write, ...state }
}
  
  
export const useSubmitTx = (
  nativeSymbol: string, offerSymbol:string, poolSymbol:string, 
  inAmount:string, minReceive:string, enabled:boolean
) => {
  // console.log("[useSubmitTx] inAmount, minReceive, enabled:", inAmount, minReceive, enabled)
  const { isConnected } = useAccount()
  const { poolAddress, abi } = usePoolContractInfo(poolSymbol)

  const swapFunction = offerSymbol == "GEX" ? "redeemSwap" : "mintSwap"
  
  const contract = offerSymbol == nativeSymbol ? {
    // mode: 'recklesslyUnprepared' as 'recklesslyUnprepared',
    addressOrName: poolAddress,
    contractInterface: abi,
    functionName: "mintSwapNative",
    args: minReceive,
    enabled: isConnected && enabled,
    overrides: {value: inAmount}
  } : {
    // mode: 'recklesslyUnprepared' as 'recklesslyUnprepared',
    addressOrName: poolAddress,
    contractInterface: abi,
    functionName: swapFunction,
    args: [inAmount, minReceive],
    enabled: isConnected && enabled
  }

  const { config, ...prepareState } = usePrepareContractWrite(contract)
  if (prepareState.error) {
    // console.log("[useSubmitTx] Prepare contract ERROR:", prepareState.error)
    // console.log("[useSubmitTx] Prepare contract CONFIG:", config)
  }
  
  const { data, write, ...writeState } = useContractWrite(config)
  
  const { ...waitState } = useWaitForTransaction({ 
    hash: data?.hash,
    confirmations: 1, 
  })
  
  const state = combineState(writeState, waitState)
  // console.log("[useSubmitTx] Combined state, enabled:", state, enabled)

  return { write, ...state }
}



/* helpers */
const combineState = (...results: QueryState[]) => ({
  isIdle: results.some((result) => result.isIdle),
  isLoading: results.some((result) => result.isLoading),
  isFetching: results.some((result) => result.isFetching),
  isSuccess: results.every((result) => result.isSuccess),
  error: results.find((result) => result.error)?.error,
})
