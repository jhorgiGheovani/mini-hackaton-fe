'use client'

import { NFT } from '@/types/contracts'
import { NFTCard } from './nft-card'

interface NFTGridProps {
  nfts: NFT[]
  loading?: boolean
  onCreateAuction?: (nft: NFT) => void
  onViewDetails?: (nft: NFT) => void
}

export function NFTGrid({ nfts, loading, onCreateAuction, onViewDetails }: NFTGridProps) {
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

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🖼️</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Belum ada NFT nih</h3>
        <p className="text-muted-foreground">
          Mint NFT pertama lo atau beli di auction
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.tokenId}
          nft={nft}
          onCreateAuction={onCreateAuction}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}

