'use client'

import { NFT } from '@/types/contracts'
import { NFTCard } from './nft-card'

interface NFTGridProps {
  nfts: NFT[]
  userAddress?: string
  loading?: boolean
  onCreateAuction?: (nft: NFT) => void
  onViewDetails?: (nft: NFT) => void
}

export function NFTGrid({ nfts, userAddress, loading, onCreateAuction, onViewDetails }: NFTGridProps) {
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
      <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
        <div className="relative w-32 h-32 rounded-3xl flex items-center justify-center mb-6 animate-glow-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl animate-gradient opacity-20" />
          <span className="text-6xl relative z-10 animate-float">🖼️</span>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Belum ada NFT nih
        </h3>
        <p className="text-muted-foreground max-w-md">
          Mint NFT pertama lo atau beli di auction buat mulai koleksi
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
          userAddress={userAddress}
          onCreateAuction={onCreateAuction}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}

