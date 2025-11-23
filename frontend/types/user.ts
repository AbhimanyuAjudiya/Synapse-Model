export interface User {
  address: string
  ensName?: string
  avatar?: string
  isConnected: boolean
}

export interface WalletState {
  user: User | null
  isConnecting: boolean
  error: string | null
}
