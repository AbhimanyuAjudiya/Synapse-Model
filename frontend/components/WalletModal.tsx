"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet, AlertTriangle, ExternalLink, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/useWallet"
import { getExplorerUrl } from "@/lib/web3"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const {
    address,
    isConnected,
    isConnecting,
    chainId,
    isOnSupportedChain,
    currentChainName,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    formatAddress,
  } = useWallet()

  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openExplorer = () => {
    if (address && chainId) {
      const explorerUrl = getExplorerUrl(chainId)
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, "_blank")
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🔗</div>
                      <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                      <p className="text-muted-foreground text-sm">
                        Connect your wallet to start using AI models on the blockchain
                      </p>
                    </div>

                    <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="lg">
                      {isConnecting ? "Connecting..." : "Connect Wallet"}
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Supports MetaMask, WalletConnect, and other Web3 wallets
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Network Warning */}
                    {!isOnSupportedChain && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>Please switch to Polygon Amoy network</span>
                          <Button variant="outline" size="sm" onClick={switchToPolygon} className="ml-2 bg-transparent">
                            Switch
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Wallet Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Network:</span>
                        <Badge variant={isOnSupportedChain ? "default" : "destructive"}>{currentChainName}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Address:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{formatAddress()}</span>
                          <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={openExplorer}
                        className="flex-1 bg-transparent"
                        disabled={!getExplorerUrl(chainId)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Explorer
                      </Button>
                      <Button variant="outline" onClick={disconnectWallet} className="flex-1 bg-transparent">
                        Disconnect
                      </Button>
                    </div>

                    {isOnSupportedChain && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                        <div className="text-green-600 text-sm font-medium">✓ Ready to use AI models</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
