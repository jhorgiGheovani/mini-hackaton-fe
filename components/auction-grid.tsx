'use client'

import { AuctionDisplay } from '@/types/contracts'
import { AuctionCard } from './auction-card'

interface AuctionGridProps {
  auctions: AuctionDisplay[]
  loading?: boolean
  userAddress?: string
  onBid?: (auction: AuctionDisplay) => void
  onEnd?: (auction: AuctionDisplay) => void
  onCancel?: (auction: AuctionDisplay) => void
}

export function AuctionGrid({ 
  auctions, 
  loading, 
  userAddress,
  onBid, 
  onEnd, 
  onCancel 
}: AuctionGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
        <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center mb-6 animate-glow-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-3xl animate-gradient opacity-20" />
          <span className="text-6xl relative z-10 animate-float">🔨</span>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Belum ada auction
        </h3>
        <p className="text-muted-foreground max-w-md">
          Buat auction pertama lo atau tunggu auction lain dimulai
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {auctions.map((auction) => (
        <AuctionCard
          key={auction.tokenId}
          auction={auction}
          userAddress={userAddress}
          onBid={onBid}
          onEnd={onEnd}
          onCancel={onCancel}
        />
      ))}
    </div>
  )
}

