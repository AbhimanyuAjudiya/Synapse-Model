"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Wallet, AlertCircle, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { simulatePayment, formatEther } from "@/lib/paymentClient"
import { useWallet } from "@/hooks/useWallet"
import type { ModelManifest } from "@/types/model"

interface PaymentFlowProps {
  model: ModelManifest
  hours: number
  totalCost: number
  onSuccess: () => void
  onCancel: () => void
}

type PaymentStep = "confirm" | "processing" | "success" | "error"

export function PaymentFlow({ model, hours, totalCost, onSuccess, onCancel }: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>("confirm")
  const [transactionHash, setTransactionHash] = useState("")
  const [error, setError] = useState("")

  const { isConnected, isOnSupportedChain, address, switchToPolygon } = useWallet()

  const handlePayment = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!isOnSupportedChain) {
      setError("Please switch to Polygon Amoy network")
      return
    }

    if (!address) {
      setError("Wallet address not available")
      return
    }

    setStep("processing")
    setError("")

    try {
      const result = await simulatePayment(
        {
          modelId: model.id,
          hours,
          pricePerHour: model.pricing?.pricePerHour || 0,
          totalCost,
        },
        address,
      )

      if (result.success) {
        setTransactionHash(result.transactionHash)
        setStep("success")
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(result.error || "Payment failed")
        setStep("error")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setStep("error")
    }
  }

  const handleRetry = () => {
    setStep("confirm")
    setError("")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 z-10"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Payment</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Please connect your wallet to proceed with payment.</AlertDescription>
              </Alert>
            )}

            {isConnected && !isOnSupportedChain && (
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

            <AnimatePresence mode="wait">
              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{hours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium">{formatEther(model.pricing?.pricePerHour || 0)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg text-primary">{formatEther(totalCost)}</span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will charge your connected wallet. Make sure you have sufficient POL balance.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button onClick={handlePayment} className="flex-1" disabled={!isConnected || !isOnSupportedChain}>
                      Pay {formatEther(totalCost)}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Processing Payment</h3>
                    <p className="text-muted-foreground text-sm">
                      Please confirm the transaction in your wallet and wait for confirmation...
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Successful!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Your payment has been processed. Redirecting to playground...
                    </p>
                    {transactionHash && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                        <p className="text-xs font-mono break-all">{transactionHash}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>

                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button onClick={handleRetry} className="flex-1">
                      Try Again
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
