import { useNetwork, useAccount, useBalance, useContractRead } from 'wagmi'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'

import { getRedeemContract } from "config/contracts.js"
import { getGEXToken } from "config/assets"
import { defaultNetworkID } from "config/networks"




const useRedeemContract = () => {
  const { chain } = useNetwork()
  const connectedNetworkId = chain?.id ?? defaultNetworkID
  const redeem = getRedeemContract(connectedNetworkId)
  
  return { 
    address: redeem.address, 
    abi: redeem.abi, 
  }
}



export const useRedeemInfo = () => {
  const { address: holderAddress, isConnected } = useAccount()
  const { address, abi } = useRedeemContract()
  console.log("[useRedeemInfo] params:", holderAddress)
  console.log("[useRedeemInfo] contract address:", address)
  
  const contract = {
    addressOrName: address,
    contractInterface: abi,
    functionName: "getHolderShare",
    args: [holderAddress],
    enabled: isConnected && !!holderAddress
  }

  const { data, refetch, ...status } = useContractRead(contract)
  console.log("[useRedeemInfo] status, contract Read:", status, data)
  return { 
    share: data?.[0].toString(), 
    collatAmount: data?.[1].toString(), 
    collatPrice: data?.[2].toString(),
    usdValue: data?.[3].toString(),
    ...status 
  }
}


export const useRedeemValues = (amount:string, enabled:boolean) => {
  const { isConnected } = useAccount()
  const { address, abi } = useRedeemContract()
  console.log("[useRedeemValues] params:", amount)
  console.log("[useRedeemValues] contract address:", address)
  
  const contract = {
    addressOrName: address,
    contractInterface: abi,
    functionName: "getRedeemValues",
    args: [amount],
    enabled: isConnected && enabled
  }

  const { data, refetch, ...status } = useContractRead(contract)
  console.log("[useRedeemValues] status, contract Read:", status, data)
  return { 
    share: data?.[0].toString(), 
    collatAmount: data?.[1].toString(), 
    collatPrice: data?.[2].toString(),
    usdValue: data?.[3].toString(),
    ...status 
  }
}



export const useRedeemTx = (amount: string, enabled: boolean) => {
  const { isConnected } = useAccount()
  const { address, abi } = useRedeemContract()

  const contract = {
    addressOrName: address,
    contractInterface: abi,
    functionName: "redeem",
    args: [amount],
    enabled: isConnected && enabled,
  }

  const { config, ...prepareState } = usePrepareContractWrite(contract)
  if (prepareState.error) {
    console.log("[useRedeemTx] Prepare contract ERROR:", prepareState.error)
    console.log("[useRedeemTx] Prepare contract CONFIG:", config)
  }
  
  const { data, write, ...writeState } = useContractWrite(config)
  
  const { ...waitState } = useWaitForTransaction({ 
    hash: data?.hash,
    confirmations: 1, 
  })
  
  const state = combineState(writeState, waitState)
  console.log("[useRedeemTx] Combined state, enabled:", state)
  return { write, ...state }
}



export const useRedeemAllTx = (enabled: boolean) => {
  const { isConnected } = useAccount()
  const { address, abi } = useRedeemContract()


  const contract = {
    addressOrName: address,
    contractInterface: abi,
    functionName: "redeemAll",
    enabled: isConnected && enabled,
  }

  const { config, ...prepareState } = usePrepareContractWrite(contract)
  if (prepareState.error) {
    console.log("[useRedeemAllTx] Prepare contract ERROR:", prepareState.error)
    console.log("[useRedeemAllTx] Prepare contract CONFIG:", config)
  }
  
  const { data, write, ...writeState } = useContractWrite(config)
  
  const { ...waitState } = useWaitForTransaction({ 
    hash: data?.hash,
    confirmations: 1, 
  })
  
  const state = combineState(writeState, waitState)
  // console.log("[useRedeemAllTx] Combined state, enabled:", state)
  return { write, ...state }
}



export const useGEXBalance = () => {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const connectedNetworkId = chain?.id ?? defaultNetworkID
  const {address: gexAddress} = getGEXToken(connectedNetworkId)

  const { data, refetch, ...status } = useBalance({
    addressOrName: address, 
    token: gexAddress, 
    enabled: isConnected
  })

  return { gexBalance: data?.value.toString(), refetch, ...status }
}



/* helpers */
const combineState = (...results: QueryState[]) => ({
  isIdle: results.some((result) => result.isIdle),
  isLoading: results.some((result) => result.isLoading),
  isFetching: results.some((result) => result.isFetching),
  isSuccess: results.every((result) => result.isSuccess),
  error: results.find((result) => result.error)?.error,
})
