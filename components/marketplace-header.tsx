'use client'

import { Sparkles, Zap } from "lucide-react"
import { LoginButton, useActiveAccount, liskSepolia } from "panna-sdk"
import { Button } from "./ui/button"

interface MarketplaceHeaderProps {
  onMintClick?: () => void
}

export function MarketplaceHeader({ onMintClick }: MarketplaceHeaderProps) {
  const activeAccount = useActiveAccount()
  const isConnected = !!activeAccount

  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-card/80 sticky top-0 z-50 animate-slide-in-down">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 animate-gradient" />
            <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            BloomBid
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Premium NFT Auction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && onMintClick && (
            <Button 
              onClick={onMintClick} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
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

