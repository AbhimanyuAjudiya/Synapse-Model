export const POLYGON_AMOY_CHAIN_ID = 80002

export interface ChainInfo {
  chainId: number
  name: string
  currency: string
  rpcUrl: string
  blockExplorer: string
}

export const POLYGON_AMOY: ChainInfo = {
  chainId: POLYGON_AMOY_CHAIN_ID,
  name: "Polygon Amoy",
  currency: "POL",
  rpcUrl: "https://polygon-amoy.g.alchemy.com/v2/MfgwMxE_nilnusAamn_chUxACP0N8o1C",
  blockExplorer: "https://www.oklink.com/amoy",
}

export function isPolygonNetwork(chainId: number): boolean {
  return chainId === POLYGON_AMOY_CHAIN_ID
}

export function getChainInfo(chainId: number): ChainInfo | null {
  switch (chainId) {
    case POLYGON_AMOY_CHAIN_ID:
      return POLYGON_AMOY
    default:
      return null
  }
}
