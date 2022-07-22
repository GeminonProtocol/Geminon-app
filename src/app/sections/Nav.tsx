import { useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useRecoilState, useSetRecoilState } from "recoil"
import classNames from "classnames/bind"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import { Auto, mobileIsMenuOpenState } from "components/layout"
import { useNav } from "../routes"
import styles from "./Nav.module.scss"
import defaultLogo from "../../styles/images/geminon/geminon_text.png"
import { useThemeLogo } from "data/settings/Theme"
import { GEMINON } from "../../config/constants"

const cx = classNames.bind(styles)

const Nav = () => {
  useCloseMenuOnNavigate()
  const { menu } = useNav()
  const [isOpen, setIsOpen] = useRecoilState(mobileIsMenuOpenState)
  const toggle = () => setIsOpen(!isOpen)
  const geminonLogo = useThemeLogo() ?? defaultLogo

  return (
    <nav>
      <header className={styles.header}>
        <a href={GEMINON} className={classNames(styles.item, styles.logo)}>
          <img src={geminonLogo} style={{height: "50px"}}/>
        </a>
        
        <button className={styles.toggle} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menu.map(({ path, title, icon }) => (
        <NavLink
          to={path}
          className={({ isActive }) =>
            cx(styles.item, styles.link, { active: isActive })
          }
          key={path}
        >
          {icon}
          {title}
        </NavLink>
      ))}
    </nav>
  )
}

/* const Nav = () => {
  useCloseMenuOnNavigate()
  const { menu } = useNav()
  const [isOpen, setIsOpen] = useRecoilState(mobileIsMenuOpenState)
  const toggle = () => setIsOpen(!isOpen)

  return (
    <nav>
      <header className={styles.header}>
        <NavLink to="/" className={classNames(styles.item, styles.logo)}>
          <strong>Terra</strong> Station
        </NavLink>

        <button className={styles.toggle} onClick={toggle}>
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {menu.map(({ path, title, icon }) => (
        <NavLink
          to={path}
          className={({ isActive }) =>
            cx(styles.item, styles.link, { active: isActive })
          }
          key={path}
        >
          {icon}
          {title}
        </NavLink>
      ))}
    </nav>
  )
} */

export default Nav

/* hooks */
const useCloseMenuOnNavigate = () => {
  const { pathname } = useLocation()
  const setIsOpen = useSetRecoilState(mobileIsMenuOpenState)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])
}
