import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useNavigate, useRoutes } from "react-router-dom"

import { ReactComponent as SwapIcon } from "styles/images/menu/Swap.svg"
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import { ReactComponent as StakeIcon } from "styles/images/menu/Stake.svg"

/* txs */
// import CollatTx from "txs/swap/CollatTx"
// import MintTx from "txs/mint/MintTx"
// import SwapTx from "txs/stableswap/SwapTx"
import RedeemTx from "txs/redeem/RedeemTx"

/* 404 */
import NotFound from "pages/NotFound"
// import UnderConstruction from "pages/UnderConstruction"

const ICON_SIZE = { width: 20, height: 20 }

export const useNav = () => {
  const { t } = useTranslation()

  const menu = [
    // {
    //   path: "/collateral",
    //   element: <CollatTx />,
    //   title: t("Collateral"),
    //   icon: <StakeIcon {...ICON_SIZE} />
    // },
    // {
    //   path: "/mint",
    //   element: <MintTx />,
    //   title: t("StableMint"),
    //   icon: <AttachMoneyIcon {...ICON_SIZE} />
    // },
    // {
    //   path: "/swap",
    //   element: <SwapTx />,
    //   title: t("ForDEX"),
    //   icon: <SwapIcon {...ICON_SIZE} />
    // },
    {
      path: "/redeem",
      element: <RedeemTx />,
      title: t("Redeem GEX"),
      icon: <SwapIcon {...ICON_SIZE} />
    },
    // {
    //   path: "/lb",
    //   element: <UnderConstruction when={'Q1 2023'}/>,
    //   title: t("Lend & Borrow"),
    //   icon: <AccountBalanceIcon {...ICON_SIZE} />
    // },
  ]

  const routes = [
    // { path: "/", element: <Dashboard /> },
    { path: "/", element: <Navigate to={"/redeem"} /> },
    /* pages */
    ...menu,
    /* 404 */
    { path: "*", element: <NotFound /> },
  ]

  return { menu, element: useRoutes(routes) }
}



/* helpers */
export const useGoBackOnError = ({ error }: QueryState) => {
  const navigate = useNavigate()
  useEffect(() => {
    if (error) navigate("..", { replace: true })
  }, [error, navigate])
}
