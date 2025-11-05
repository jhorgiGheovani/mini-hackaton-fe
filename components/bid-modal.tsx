'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useContract } from '@/hooks/useContract'
import { placeBid } from '@/lib/contract'
import { AuctionDisplay } from '@/types/contracts'
import { Loader2, Hammer } from 'lucide-react'
import Image from 'next/image'

interface BidModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: AuctionDisplay | null
  onSuccess?: () => void
}

export function BidModal({ open, onOpenChange, auction, onSuccess }: BidModalProps) {
  const { client, account } = useContract()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [bidAmount, setBidAmount] = useState('')

  const minBid = auction?.highestBid !== '0.0' 
    ? (parseFloat(auction?.highestBid || '0') + 0.001).toFixed(4)
    : auction?.startingBid || '0'

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!client || !account || !auction) {
      toast({
        title: 'Error',
        description: 'Wallet belum connect atau auction ga ada',
        variant: 'destructive'
      })
      return
    }

    const bidValue = parseFloat(bidAmount)
    const minValue = parseFloat(minBid)

    if (!bidAmount || bidValue < minValue) {
      toast({
        title: 'Bid terlalu kecil',
        description: `Minimal bid: ${minBid} ETH`,
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      await placeBid(signer, auction.tokenId, bidAmount)

      toast({
        title: 'Bid berhasil!',
        description: `Lo udah bid ${bidAmount} ETH nih!`
      })

      setBidAmount('')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Bid error:', error)
      toast({
        title: 'Bid gagal',
        description: error.message || 'Gagal place bid',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!auction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Place Bid</DialogTitle>
          <DialogDescription>
            Masukin bid amount lo buat NFT ini
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 mb-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={auction.nft?.imageUrl || '/placeholder.svg'}
                alt={auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold">
                {auction.nft?.metadata?.name || `NFT #${auction.tokenId}`}
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Bid:</span>
                  <span className="font-medium">{auction.startingBid} ETH</span>
                </div>
                {auction.highestBid !== '0.0' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Bid:</span>
                    <span className="font-bold text-primary">{auction.highestBid} ETH</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleBid} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidAmount">Bid Amount (ETH)</Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.001"
              placeholder={minBid}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Minimal bid: {minBid} ETH
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !bidAmount}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bidding...
                </>
              ) : (
                <>
                  <Hammer className="mr-2 h-4 w-4" />
                  Place Bid
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

