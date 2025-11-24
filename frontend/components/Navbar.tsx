"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Menu, X, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletModal } from "@/components/WalletModal"
import { useSuiWallet } from "@/hooks/useSuiWallet"
import { ConnectButton } from "@mysten/dapp-kit"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)

  const { isConnected, formatAddress } = useSuiWallet()

  const navItems = [
    { href: "/upload", label: "Upload" },
    { href: "/models", label: "Models" },
    { href: "/about", label: "About" },
  ]

  const handleWalletClick = () => {
    setShowWalletModal(true)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 6 }}
                className="w-10 h-10 bg-gradient-to-br from-white-500 via-white-600 to-blue-700 rounded-lg flex items-center justify-center shadow-xl ring-2 ring-sky-400/50 border border-white/20"
              >
                <img src="/logosmall.png" alt="Synapse Model logo" className="w-9 h-9 object-contain" loading="lazy" />
              </motion.div>
              <span className="font-bold text-xl text-foreground">Synapse Model</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}

              {/* Wallet Connection */}
              <div className="flex items-center space-x-2">
                <ConnectButton />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden py-4 border-t border-border"
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="flex flex-col space-y-2">
                  <ConnectButton />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </>
  )
}
