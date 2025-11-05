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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔨</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Belum ada auction</h3>
        <p className="text-muted-foreground">
          Buat auction pertama lo atau tunggu auction lain
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

