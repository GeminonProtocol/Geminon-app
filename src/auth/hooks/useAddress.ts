// import { useConnectedWallet } from "@terra-money/use-wallet"
// import useAuth from "./useAuth"


const dummyAddress = "terra1p5hgj5fdvyjw8z86hjezvanjm0q7jm5j299tnj"
const useAddress = () => {return dummyAddress}

/* auth | walle-provider */
/* const useAddress = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  return wallet?.address ?? connected?.terraAddress
} */

export default useAddress
