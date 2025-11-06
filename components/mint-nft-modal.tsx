'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useContract } from '@/hooks/useContract'
import { mintNFT } from '@/lib/contract'
import { Loader2, Upload, Image as ImageIcon, X } from 'lucide-react'

interface MintNFTModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function MintNFTModal({ open, onOpenChange, onSuccess }: MintNFTModalProps) {
  const { client, account } = useContract()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadStep, setUploadStep] = useState<'form' | 'uploading' | 'minting'>('form')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    artist: '',
    category: '',
    rarity: '',
    initialPrice: '0.01',
    auctionStartTime: '',
    auctionEndTime: '',
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'File gak valid',
        description: 'Upload file gambar dong bro',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!selectedFile) {
      toast({
        title: 'Gambar belum dipilih',
        description: 'Pilih gambar lo dulu bro',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Nama NFT kosong',
        description: 'Kasih nama dong buat NFT lo',
        variant: 'destructive'
      })
      return false
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Deskripsi kosong',
        description: 'Kasih deskripsi buat NFT lo',
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!client || !account) {
      toast({
        title: 'Wallet belum connect',
        description: 'Connect wallet dulu bro',
        variant: 'destructive'
      })
      return
    }

    if (!validateForm()) return

    setLoading(true)
    setUploadStep('uploading')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile!)
      uploadFormData.append('name', formData.name)
      uploadFormData.append('description', formData.description)
      
      const attributes = []
      if (formData.artist) attributes.push({ trait_type: 'Artist', value: formData.artist })
      if (formData.category) attributes.push({ trait_type: 'Category', value: formData.category })
      if (formData.rarity) attributes.push({ trait_type: 'Rarity', value: formData.rarity })
      uploadFormData.append('attributes', JSON.stringify(attributes))
      
      uploadFormData.append('created_at', new Date().toISOString())
      uploadFormData.append('initial_price', `${formData.initialPrice} ETH`)
      
      if (formData.auctionStartTime && formData.auctionEndTime) {
        const auction = {
          start_time: new Date(formData.auctionStartTime).toISOString(),
          end_time: new Date(formData.auctionEndTime).toISOString(),
        }
        uploadFormData.append('auction', JSON.stringify(auction))
      }

      const uploadResponse = await fetch('http://localhost:3000/api/nft/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Gagal upload ke IPFS')
      }

      const uploadResult = await uploadResponse.json()
      
      if (!uploadResult.success || !uploadResult.data?.metadata_cid) {
        throw new Error('Response API gak lengkap')
      }

      const metadataCID = uploadResult.data.metadata_cid

      toast({
        title: 'Upload ke IPFS berhasil!',
        description: `Metadata CID: ${metadataCID}`,
      })

      setUploadStep('minting')

      const result = await mintNFT(client, account, metadataCID, '0.001')

      toast({
        title: 'NFT Minted!',
        description: `NFT udah di-mint nih!`
      })

      setFormData({
        name: '',
        description: '',
        artist: '',
        category: '',
        rarity: '',
        initialPrice: '0.01',
        auctionStartTime: '',
        auctionEndTime: '',
      })
      setSelectedFile(null)
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
      setUploadStep('form')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mint NFT Baru</DialogTitle>
          <DialogDescription>
            Upload gambar dan metadata, nanti otomatis ke IPFS terus mint ke blockchain
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-2">
            <Label>Gambar NFT</Label>
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Klik buat pilih gambar lo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative border rounded-lg overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama NFT *</Label>
              <Input
                id="name"
                placeholder="Ocean Dreams #1"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                placeholder="Ceritain tentang NFT lo..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                placeholder="Nama artist"
                value={formData.artist}
                onChange={(e) => handleInputChange('artist', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Digital Art"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rarity">Rarity</Label>
              <Input
                id="rarity"
                placeholder="Common, Rare, Legendary"
                value={formData.rarity}
                onChange={(e) => handleInputChange('rarity', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial Price (ETH)</Label>
              <Input
                id="initialPrice"
                type="number"
                step="0.001"
                placeholder="0.01"
                value={formData.initialPrice}
                onChange={(e) => handleInputChange('initialPrice', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <Label className="text-sm font-medium">Auction (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auctionStartTime" className="text-xs">
                  Start Time
                </Label>
                <Input
                  id="auctionStartTime"
                  type="datetime-local"
                  value={formData.auctionStartTime}
                  onChange={(e) => handleInputChange('auctionStartTime', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auctionEndTime" className="text-xs">
                  End Time
                </Label>
                <Input
                  id="auctionEndTime"
                  type="datetime-local"
                  value={formData.auctionEndTime}
                  onChange={(e) => handleInputChange('auctionEndTime', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
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
              disabled={loading || !selectedFile || !formData.name || !formData.description}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadStep === 'uploading' && 'Uploading ke IPFS...'}
                  {uploadStep === 'minting' && 'Minting...'}
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload & Mint NFT
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

