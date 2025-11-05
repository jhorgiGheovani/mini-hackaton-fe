'use client'

import { Sparkles } from "lucide-react"
import { LoginButton, useActiveAccount, liskSepolia } from "panna-sdk"
import { Button } from "./ui/button"

interface MarketplaceHeaderProps {
  onMintClick?: () => void
}

export function MarketplaceHeader({ onMintClick }: MarketplaceHeaderProps) {
  const activeAccount = useActiveAccount()
  const isConnected = !!activeAccount

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 animate-slide-in-down">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bloom NFT</h1>
            <p className="text-xs text-muted-foreground">NFT Auction Marketplace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && onMintClick && (
            <Button onClick={onMintClick} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Mint NFT
            </Button>
          )}
          <LoginButton chain={liskSepolia} />
        </div>
      </div>
    </header>
  )
}

