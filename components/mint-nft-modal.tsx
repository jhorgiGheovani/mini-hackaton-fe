'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useContract } from '@/hooks/useContract'
import { mintNFT } from '@/lib/contract'
import { Loader2, Image as ImageIcon } from 'lucide-react'

interface MintNFTModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MintNFTModal({ open, onOpenChange, onSuccess }: MintNFTModalProps) {
  const { client, account } = useContract()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [ipfsHash, setIpfsHash] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!client || !account) {
      toast({
        title: 'Wallet not connected',
        description: 'Connect wallet dulu bro',
        variant: 'destructive'
      })
      return
    }

    if (!ipfsHash.trim()) {
      toast({
        title: 'IPFS Hash required',
        description: 'Masukin IPFS hash lo dulu',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      const result = await mintNFT(signer, ipfsHash.trim(), '0.001')

      toast({
        title: 'NFT Minted!',
        description: `NFT #${result.tokenId} udah di-mint nih!`
      })

      setIpfsHash('')
      setImagePreview('')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Mint error:', error)
      toast({
        title: 'Mint failed',
        description: error.message || 'Gagal mint NFT nih',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleIPFSChange = (value: string) => {
    setIpfsHash(value)
    if (value.startsWith('Qm') || value.startsWith('bafy')) {
      setImagePreview(`https://gateway.pinata.cloud/ipfs/${value}`)
    } else {
      setImagePreview('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mint NFT Baru</DialogTitle>
          <DialogDescription>
            Mint NFT lo ke blockchain. Biaya admin: 0.001 ETH
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ipfsHash">IPFS Hash / CID</Label>
            <Input
              id="ipfsHash"
              placeholder="Qm... atau bafy..."
              value={ipfsHash}
              onChange={(e) => handleIPFSChange(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Upload gambar lo ke IPFS (Pinata, NFT.storage, dll) dulu ya
            </p>
          </div>

          {imagePreview && (
            <div className="border rounded-lg p-4 space-y-2">
              <Label>Preview</Label>
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="NFT Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview('')}
                />
              </div>
            </div>
          )}

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
              disabled={loading || !ipfsHash.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Mint NFT
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

