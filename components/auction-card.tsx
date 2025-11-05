'use client'

import { useState, useEffect } from 'react'
import { AuctionDisplay } from '@/types/contracts'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hammer, Clock, Trophy, X } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface AuctionCardProps {
  auction: AuctionDisplay
  userAddress?: string
  onBid?: (auction: AuctionDisplay) => void
  onEnd?: (auction: AuctionDisplay) => void
  onCancel?: (auction: AuctionDisplay) => void
}

export function AuctionCard({ auction, userAddress, onBid, onEnd, onCancel }: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isActive, setIsActive] = useState(auction.active)
  
  const isOwner = userAddress?.toLowerCase() === auction.seller.toLowerCase()
  const isHighestBidder = userAddress?.toLowerCase() === auction.highestBidder.toLowerCase()
  const hasNoBids = auction.highestBidder === '0x0000000000000000000000000000000000000000'
  const canEnd = auction.endTime * 1000 <= Date.now() && auction.active
  const canCancel = isOwner && hasNoBids && auction.active

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const end = auction.endTime * 1000
      
      if (now >= end) {
        setTimeLeft('Ended')
        setIsActive(false)
      } else {
        try {
          setTimeLeft(formatDistanceToNow(end, { addSuffix: true }))
          setIsActive(true)
        } catch (err) {
          setTimeLeft('Calculating...')
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [auction.endTime])

  const getStatusBadge = () => {
    if (!auction.active) {
      return <Badge variant="secondary">Ended</Badge>
    }
    if (canEnd) {
      return <Badge className="bg-red-500">Ready to End</Badge>
    }
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>
    }
    return <Badge variant="secondary">Ended</Badge>
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square bg-muted">
        <Image
          src={auction.nft?.imageUrl || '/placeholder.svg'}
          alt={auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {getStatusBadge()}
          {isHighestBidder && auction.active && (
            <Badge className="bg-blue-500">
              <Trophy className="w-3 h-3 mr-1" />
              Lo Lead
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg truncate">
            {auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {auction.nft?.metadata?.description || 'No description'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Starting Bid:</span>
            <span className="font-medium">{auction.startingBid} ETH</span>
          </div>
          
          {auction.highestBid !== '0.0' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Bid:</span>
              <span className="font-bold text-primary">{auction.highestBid} ETH</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
              {timeLeft}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {isActive && !isOwner && onBid && (
          <Button
            className="flex-1"
            onClick={() => onBid(auction)}
          >
            <Hammer className="w-4 h-4 mr-1" />
            Place Bid
          </Button>
        )}
        
        {canEnd && (isOwner || isHighestBidder) && onEnd && (
          <Button
            className="flex-1"
            variant="default"
            onClick={() => onEnd(auction)}
          >
            <Trophy className="w-4 h-4 mr-1" />
            End Auction
          </Button>
        )}

        {canCancel && onCancel && (
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => onCancel(auction)}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}

        {isOwner && auction.active && !canEnd && (
          <Button className="flex-1" disabled variant="outline">
            Your Auction
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

