import { ReactNode } from "react"
import { toAmount } from "@terra.kitchen/utils"

/* animation */
import AnimationLight from "./Light/Broadcasting.png"
import AnimationDark from "./Dark/Broadcasting.png"
import AnimationBlossom from "./Blossom/Broadcasting.png"
import AnimationMoon from "./Moon/Broadcasting.png"
import AnimationWhale from "./Whale/Broadcasting.png"
import AnimationMadness from "./Madness/Broadcasting.png"

/* favicon */
import FaviconLight from "./Light/favicon.png"
import FaviconDark from "./Dark/favicon.png"
import FaviconBlossom from "./Blossom/favicon.png"
import FaviconMoon from "./Moon/favicon.png"
import FaviconWhale from "./Whale/favicon.png"
import FaviconMadness from "./Madness/favicon.png"

/* geminon logo */
import GeminonLight from "./Light/geminon_text.png"
import GeminonDark from "./Dark/geminon_text.png"
import GeminonBlossom from "./Blossom/geminon_text.png"
import GeminonMoon from "./Moon/geminon_text.png"
import GeminonWhale from "./Whale/geminon_text.png"
import GeminonMadness from "./Madness/geminon_text.png"

/* preview */
import { ReactComponent as PreviewLight } from "./Light/preview.svg"
import { ReactComponent as PreviewDark } from "./Dark/preview.svg"
import { ReactComponent as PreviewBlossom } from "./Blossom/preview.svg"
import { ReactComponent as PreviewMoon } from "./Moon/preview.svg"
import { ReactComponent as PreviewWhale } from "./Whale/preview.svg"
import { ReactComponent as PreviewMadness } from "./Madness/preview.svg"

export interface Theme {
  name: string
  unlock: Amount
  animation: string
  favicon: string
  preview: ReactNode
  logo: string
}

export const themes: Theme[] = [
  {
    name: "light",
    unlock: toAmount("0"),
    animation: AnimationLight,
    favicon: FaviconLight,
    preview: <PreviewLight />,
    logo: GeminonLight
  },
  {
    name: "dark",
    unlock: toAmount("0"),
    animation: AnimationDark,
    favicon: FaviconDark,
    preview: <PreviewDark />,
    logo: GeminonDark
  },
  {
    name: "blossom",
    unlock: toAmount("0"),
    animation: AnimationBlossom,
    favicon: FaviconBlossom,
    preview: <PreviewBlossom />,
    logo: GeminonBlossom
  },
  {
    name: "moon",
    unlock: toAmount("0"),
    animation: AnimationMoon,
    favicon: FaviconMoon,
    preview: <PreviewMoon />,
    logo: GeminonMoon
  },
  {
    name: "whale",
    unlock: toAmount("0"),
    animation: AnimationWhale,
    favicon: FaviconWhale,
    preview: <PreviewWhale />,
    logo: GeminonWhale
  },
  {
    name: "madness",
    unlock: toAmount("0"),
    animation: AnimationMadness,
    favicon: FaviconMadness,
    preview: <PreviewMadness />,
    logo: GeminonMadness
  },
]

export default themes
