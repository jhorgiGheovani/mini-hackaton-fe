'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useContract } from '@/hooks/useContract'
import { createAuction } from '@/lib/contract'
import { NFT } from '@/types/contracts'
import { Loader2, Hammer } from 'lucide-react'
import Image from 'next/image'

interface CreateAuctionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nft: NFT | null
  onSuccess?: () => void
}

export function CreateAuctionModal({ open, onOpenChange, nft, onSuccess }: CreateAuctionModalProps) {
  const { client, account } = useContract()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [startingBid, setStartingBid] = useState('')
  const [duration, setDuration] = useState('86400')

  const durationOptions = [
    { label: '3 Minutes', value: '180' },
    { label: '1 Hour', value: '3600' },
    { label: '6 Hours', value: '21600' },
    { label: '12 Hours', value: '43200' },
    { label: '1 Day', value: '86400' },
    { label: '3 Days', value: '259200' },
    { label: '7 Days', value: '604800' }
  ]

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!client || !account || !nft) {
      toast({
        title: 'Error',
        description: 'Wallet belum connect atau NFT ga ada',
        variant: 'destructive'
      })
      return
    }

    if (!startingBid || parseFloat(startingBid) <= 0) {
      toast({
        title: 'Invalid bid',
        description: 'Starting bid harus lebih dari 0',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      console.log('🔨 Creating auction untuk NFT #', nft.tokenId)
      console.log('📊 Starting Bid:', startingBid, 'ETH')
      console.log('⏰ Duration:', parseInt(duration), 'seconds')
      
      const result = await createAuction(
        client,
        account,
        BigInt(nft.tokenId),
        startingBid,
        parseInt(duration)
      )

      console.log('✅ Auction Created! Transaction Hash:', result.transactionHash)
      console.log('📡 Event AuctionCreated triggered dari smart contract')

      toast({
        title: 'Auction Created! 🎉',
        description: `Auction buat NFT #${nft.tokenId} udah dibuat! Event AuctionCreated triggered.`
      })

      setStartingBid('')
      setDuration('86400')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('❌ Create auction error:', error)
      toast({
        title: 'Failed',
        description: error.message || 'Gagal bikin auction',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!nft) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-2 border-blue-500/30 shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔨 Create Auction
          </DialogTitle>
          <DialogDescription>
            Set starting bid dan durasi auction lo
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 mb-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={nft.imageUrl}
                alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{nft.metadata?.name || `NFT #${nft.tokenId}`}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {nft.metadata?.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateAuction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startingBid">Starting Bid (ETH)</Label>
            <Input
              id="startingBid"
              type="number"
              step="0.001"
              placeholder="0.01"
              value={startingBid}
              onChange={(e) => setStartingBid(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durasi Auction</Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
              disabled={loading || !startingBid}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Hammer className="mr-2 h-4 w-4" />
                  Create Auction
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

