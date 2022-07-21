import { PropsWithChildren } from "react"
// import { useNodeInfo } from "data/queries/tendermint"
// import Overlay from "./components/Overlay"
// import NetworkError from "./NetworkError"



const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  console.log("[WithNodeInfo] Componente obsoleto, eliminar")
  return <>{children}</>
}

export default WithNodeInfo


// useNodeInfo() llama a la url contenida en la propiedad "lcd" de una red
// definida en networks para comprobar el estado del nodo de la red Terra.
// Específico de Terra, desactivar.
/* const WithNodeInfo = ({ children }: PropsWithChildren<{}>) => {
  const { isLoading, isError } = useNodeInfo()

  if (isError) {
    return (
      <Overlay>
        <NetworkError />
      </Overlay>
    )
  }

  if (isLoading) return null
  return <>{children}</>
} */