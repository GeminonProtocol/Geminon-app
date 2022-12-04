import RefreshIcon from "@mui/icons-material/Refresh"
import HeaderIconButton from "../components/HeaderIconButton"

const Refresh = () => {
  return (
    <HeaderIconButton onClick={() => window.location.reload()}>
      <RefreshIcon style={{ fontSize: 18 }} />
    </HeaderIconButton>
  )
}

export default Refresh
