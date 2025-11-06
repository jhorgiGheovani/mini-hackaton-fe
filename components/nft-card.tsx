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
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square bg-muted">
        <Image
          src={nft.imageUrl}
          alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        {nft.isInAuction && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            In Auction
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg truncate">
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {nft.metadata?.description || 'No description'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="font-mono">{formatAddress(nft.creator)}</span>
        </div>

        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nft.metadata.attributes.slice(0, 2).map((attr, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
            {nft.metadata.attributes.length > 2 && (
              <Badge variant="outline" className="text-xs">
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
                className="flex-1"
                onClick={() => {
                  console.log('🎯 Button Create Auction clicked untuk NFT #', nft.tokenId)
                  console.log('👤 Creator:', nft.creator)
                  console.log('🏠 Owner:', nft.owner)
                  console.log('📝 Opening modal untuk input auction details...')
                  onCreateAuction(nft)
                }}
              >
                <Hammer className="w-4 h-4 mr-1" />
                Create Auction
              </Button>
            )}
            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onViewDetails(nft)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

