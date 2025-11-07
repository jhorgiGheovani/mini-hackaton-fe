'use client'

import { NFT } from '@/types/contracts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hammer, Eye, User } from 'lucide-react'
import Image from 'next/image'

interface NFTCardProps {
  nft: NFT
  userAddress?: string
  showActions?: boolean
  onCreateAuction?: (nft: NFT) => void
  onViewDetails?: (nft: NFT) => void
}

const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function NFTCard({ nft, userAddress, showActions = true, onCreateAuction, onViewDetails }: NFTCardProps) {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
  
  const isCreator = userAddress && nft.creator.toLowerCase() === userAddress.toLowerCase()
  const isNotInContract = nft.owner.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
  const canCreateAuction = isCreator && isNotInContract && !nft.isInAuction
  
  return (
    <Card className="group overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all duration-500 animate-scale-in backdrop-blur-sm bg-card/95 shadow-xl hover:shadow-2xl hover:-translate-y-2">
      <div className="relative aspect-square bg-gradient-to-br from-purple-500/10 to-blue-500/10 overflow-hidden">
        <Image
          src={nft.imageUrl}
          alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {nft.isInAuction && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg border-0">
            🔥 Live Auction
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 space-y-3 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500" />
        
        <div>
          <h3 className="font-bold text-lg truncate bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {nft.metadata?.description || 'No description'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <User className="w-3.5 h-3.5" />
          <span className="font-mono">{formatAddress(nft.creator)}</span>
        </div>

        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {nft.metadata.attributes.slice(0, 2).map((attr, idx) => (
              <Badge key={idx} variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
            {nft.metadata.attributes.length > 2 && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                +{nft.metadata.attributes.length - 2}
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {canCreateAuction && onCreateAuction && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                onClick={() => {
                  console.log('🎯 Button Create Auction clicked untuk NFT #', nft.tokenId)
                  console.log('👤 Creator:', nft.creator)
                  console.log('🏠 Owner:', nft.owner)
                  console.log('📝 Opening modal untuk input auction details...')
                  onCreateAuction(nft)
                }}
              >
                <Hammer className="w-4 h-4 mr-1" />
                Auction
              </Button>
            )}
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 hover:bg-purple-500/10 hover:border-purple-500/50"
                onClick={() => onViewDetails(nft)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

