import BigNumber from "bignumber.js"

import { useNetwork, useAccount, useBalance, useContractRead, useContractReads, erc20ABI } from 'wagmi'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'

// import { combineState } from "data/query"

import { getMinterContract } from "config/contracts.js"
import { defaultNetworkID } from "config/networks"


interface QueryState {
  isIdle?: boolean
  isLoading?: boolean
  isFetching?: boolean
  isSuccess?: boolean
  error?: Error | unknown
}

const combineState = (...results: QueryState[]) => ({
  isIdle: results.some((result) => result.isIdle),
  isLoading: results.some((result) => result.isLoading),
  isFetching: results.some((result) => result.isFetching),
  isSuccess: results.every((result) => result.isSuccess),
  error: results.find((result) => result.error)?.error,
})


export const useReadBalances = (tokensList: TokenEVM[]) => {
  // console.log("[useReadBalances] tokensList", tokensList)
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
  
  const { data, refetch } = useContractReads({ contracts })
  
  const tokensPool: PoolToken[] = tokensList.map((asset, index) => {
    // console.log("[useReadBalances] asset / balance", asset.symbol, new BigNumber(data?.[index]?.toString() ?? "0").shiftedBy(18-asset.uwdecimals).toFixed(0))
    return {
      ...asset, 
      balance: new BigNumber(data?.[index]?.toString() ?? "0").shiftedBy(18-asset.uwdecimals).toFixed(0)
    }
  })
  // console.log("[useReadBalances] assetsList", tokensPool)

  return {assetsList: tokensPool, refetchTokens: refetch}
}


export const useStableAsset = (offerAsset: TokenEVM, askAsset: TokenEVM) => {
  return offerAsset.key == "gex" ? askAsset : offerAsset
}

const useMinterContract = () => {
  const { chain } = useNetwork()
  const connectedNetworkId = chain?.id.toString() ?? defaultNetworkID
  const scminter = getMinterContract(connectedNetworkId)
  
  return { 
    minterAddress: scminter.address, 
    abi: scminter.abi, 
  }
}

export const useMinterInfo = (offerSymbol:string, offerAmount:string, stablecoinAddress:string, enabled:boolean) => {
  const { isConnected } = useAccount()
  const { minterAddress, abi } = useMinterContract()
  // console.log("[useMinterInfo] params:", offerSymbol, offerAmount, stablecoinAddress, enabled)
  
  const contract = offerSymbol === "GEX" ? 
  {
    addressOrName: minterAddress,
    contractInterface: abi,
    functionName: "getMintInfo",
    args: [offerAmount, stablecoinAddress],
    enabled: isConnected && enabled
  } : {
    addressOrName: minterAddress,
    contractInterface: abi,
    functionName: "getRedeemInfo",
    args: [offerAmount, stablecoinAddress],
    enabled: isConnected && enabled
  }

  const { data, refetch, ...status } = useContractRead(contract)
  // console.log("[useMinterInfo] status, contract Read:", status, data)
  // if (status.error) // console.log("[useMinterInfo] Contract read ERROR:", data, status.error)
  
  return { 
    offerAssetPrice: data?.[0].toString(),
    askAssetPrice: data?.[1].toString(),
    feePerc: data?.[2].toString(),  // Number as string in 1e6 units
    feeAmount: data?.[3].toString(),
    outAmount: data?.[4].toString()
  }
}


export const useSwapInfo = (offerAmount:string, offerAddress:string, askAddress:string, enabled:boolean) => {
  const { isConnected } = useAccount()
  const { minterAddress, abi } = useMinterContract()
  // console.log("[useSwapInfo] params:", offerAmount, offerAddress, askAddress, enabled)
  
  const contract = {
    addressOrName: minterAddress,
    contractInterface: abi,
    functionName: "getStableSwapInfo",
    args: [offerAmount, offerAddress, askAddress],
    enabled: isConnected && enabled
  }

  const { data, refetch, ...status } = useContractRead(contract)
  // console.log("[useSwapInfo] status, contract Read:", status, data)
  // if (status.error) // console.log("[useSwapInfo] Contract read ERROR:", data, status.error)
  
  return { 
    offerAssetPrice: data?.[0].toString(),
    askAssetPrice: data?.[1].toString(),
    askAssetRatio: data?.[2].toString(),
    feePerc: data?.[3].toString(),  // Number as string in 1e6 units
    feeAmount: data?.[4].toString(),
    outAmount: data?.[5].toString()
  }
}



export const useFetchAllowance = (tokenAddress:string, enabled:boolean) => {
  // console.log("[useFetchAllowance] tokenAddress, enabled:", tokenAddress, enabled)
  const { address, isConnected } = useAccount()
  const { minterAddress } = useMinterContract()
  
  const contract = {
      addressOrName: tokenAddress ?? "",
      contractInterface: erc20ABI,
      functionName: "allowance",
      args: [address, minterAddress],
      enabled: isConnected && enabled && !!tokenAddress
    }
  
  const { data, refetch, ...status } = useContractRead(contract)
  // console.log("[useFetchAllowance] allowedAmount, status:", data, status)
  
  return {allowedAmount: data?.toString(), refetchAllowance: refetch}
}
  
  
export const useInfiniteApprove = (tokenAddress:string, enabled:boolean) => {
  // console.log("[useInfiniteApprove] tokenAddress, enabled:", tokenAddress, enabled)  
  const { isConnected } = useAccount()
  const { minterAddress } = useMinterContract()

  const maxUint256 = new BigNumber(2).exponentiatedBy(256).minus(1).toFixed()
  
  const contract = {
    addressOrName: tokenAddress,
    contractInterface: erc20ABI,
    functionName: "approve",
    args: [minterAddress, maxUint256],
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
  
  
export const useSubmitTx = (offerSymbol:string, stablecoinAddress:string, inAmount:string, enabled:boolean) => {
  // console.log("[useSubmitTx] offerSymbol, inAmount, stablecoinAddress, enabled:", offerSymbol, inAmount, stablecoinAddress, enabled)
  const { isConnected } = useAccount()
  const { minterAddress, abi } = useMinterContract()

  const swapFunction = offerSymbol == "GEX" ? "mintStablecoin" : "redeemStablecoin"
  
  const contract = {
    addressOrName: minterAddress,
    contractInterface: abi,
    functionName: swapFunction,
    args: [stablecoinAddress, inAmount],
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


export const useSubmitSwapTx = (offerAddress:string, askAddress:string, inAmount:string, enabled:boolean) => {
  // console.log("[useSubmitSwapTx] offerAddress, askAddress, inAmount, enabled:", offerAddress, askAddress, inAmount, enabled)
  const { isConnected } = useAccount()
  const { minterAddress, abi } = useMinterContract()

  const contract = {
    addressOrName: minterAddress,
    contractInterface: abi,
    functionName: 'stableSwap',
    args: [offerAddress, askAddress, inAmount],
    enabled: isConnected && enabled
  }

  const { config, ...prepareState } = usePrepareContractWrite(contract)
  if (prepareState.error) {
    // console.log("[useSubmitSwapTx] Prepare contract ERROR:", prepareState.error)
    // console.log("[useSubmitSwapTx] Prepare contract CONFIG:", config)
  }
  
  const { data, write, ...writeState } = useContractWrite(config)
  
  const { ...waitState } = useWaitForTransaction({ 
    hash: data?.hash,
    confirmations: 1, 
  })
  
  const state = combineState(writeState, waitState)
  // console.log("[useSubmitSwapTx] Combined state, enabled:", state, enabled)

  return { write, ...state }
}
