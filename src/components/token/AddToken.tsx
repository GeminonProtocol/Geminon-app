import { useTranslation } from "react-i18next"
import { useAccount } from 'wagmi'
import { Button } from "components/general"

import { getGEXToken, gexUrlIcon } from "config/assets"


interface Props {networkID: number}

const AddToken = (networkID: Props) => {
    const { t } = useTranslation()
    const { connector, isConnected } = useAccount()
    const gexToken: TokenEVM = getGEXToken(networkID)
    
    // console.log("[AddToken] connector", connector?.name)
    if (!isConnected || !connector) return null

    // Wagmi method has a bug. It doesn't work.
    // function addToken() {
    //     (async () => {
    //         if (typeof connector?.watchAsset === 'function') {
    //             await connector?.watchAsset({
    //                 address: gexAddress, // The address that the token is at.
    //                 decimals: gexToken.decimals,
    //                 symbol: gexToken.symbol, // A ticker symbol or shorthand, up to 5 chars.
    //                 image: gexUrlIcon, // A string url of the token logo
    //                 }
    //             )
    //         }
    //     })()
    // }
    function addToken() {
        (async () => {
            if (window.ethereum) {
                await window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: {
                            address: gexToken.address,
                            symbol: gexToken.symbol,
                            decimals: gexToken.decimals,
                            image: gexUrlIcon, // A string url of the token logo
                        },
                    },
                })
            }
        })()
    }


    return (
        <Button onClick={addToken} size="small" block>
            {t("Add token to wallet")}
        </Button>
    )
}

export default AddToken



