import { PropsWithChildren } from "react"
import InitWeb3 from "app/InitWeb3"
import InitNetworks from "app/InitNetworks"
import InitWallet from "app/InitWallet"


const InitAdapter = ({ children }: PropsWithChildren<{}>) => {

    return (
        <InitWeb3>
            <InitNetworks>
                <InitWallet>
                    {children} 
                </InitWallet>
            </InitNetworks>
        </InitWeb3>
    )
}


export default InitAdapter