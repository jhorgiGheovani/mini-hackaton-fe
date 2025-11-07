'use client'

import { useState, useEffect } from 'react'
import { AuctionDisplay } from '@/types/contracts'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hammer, Clock, Trophy, X, User } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface AuctionCardProps {
  auction: AuctionDisplay
  userAddress?: string
  onBid?: (auction: AuctionDisplay) => void
  onEnd?: (auction: AuctionDisplay) => void
  onCancel?: (auction: AuctionDisplay) => void
}

const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
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
      return <Badge className="bg-gray-600 text-white border-0">⏹️ Ended</Badge>
    }
    if (canEnd) {
      return <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg">🔔 Ready</Badge>
    }
    if (isActive) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">⚡ Live</Badge>
    }
    return <Badge className="bg-gray-600 text-white border-0">⏹️ Ended</Badge>
  }

  return (
    <Card className="group overflow-hidden border-2 border-transparent hover:border-blue-500/50 transition-all duration-500 animate-scale-in backdrop-blur-sm bg-card/95 shadow-xl hover:shadow-2xl hover:-translate-y-2">
      <div className="relative aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
        <Image
          src={auction.nft?.imageUrl || '/placeholder.svg'}
          alt={auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {getStatusBadge()}
          {isHighestBidder && auction.active && (
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg border-0 animate-glow-pulse">
              <Trophy className="w-3 h-3 mr-1" />
              Leading bidder!
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-5 space-y-3 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
        
        <div>
          <h3 className="font-bold text-lg truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {auction.nft?.metadata?.description || 'No description'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <User className="w-3.5 h-3.5" />
          <span className="font-mono">{formatAddress(auction.seller)}</span>
        </div>

        <div className="space-y-2.5 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Starting:</span>
            <span className="font-semibold">{auction.startingBid} ETH</span>
          </div>
          
          {auction.highestBid !== '0.0' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {auction.highestBid} ETH
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm pt-1 border-t border-border/30">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
              {timeLeft}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {isActive && !isOwner && onBid && (
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            onClick={() => onBid(auction)}
          >
            <Hammer className="w-4 h-4 mr-1" />
            Place Bid
          </Button>
        )}
        
        {canEnd && (isOwner || isHighestBidder) && onEnd && (
          <Button
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            onClick={() => onEnd(auction)}
          >
            <Trophy className="w-4 h-4 mr-1" />
            End
          </Button>
        )}

        {canCancel && onCancel && (
          <Button
            className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
            onClick={() => onCancel(auction)}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}

        {isOwner && auction.active && !canEnd && (
          <Button className="flex-1 bg-muted/50" disabled variant="outline">
            Your Auction
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

