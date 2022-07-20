type NetworkName = string

interface TerraNetwork {
  name: NetworkName
  chainID: string
  lcd: string
  api?: string
}

interface CustomNetwork extends TerraNetwork {
  preconfigure?: boolean
}

/* Records son pares clave valor (diccionarios de python), en
 * este caso la clave es el nombre de la red y el valor es un
 * diccionario con la estructura definida en el interface
 * correspondiente. */
type TerraNetworks = Record<NetworkName, TerraNetwork>
type CustomNetworks = Record<NetworkName, CustomNetwork>