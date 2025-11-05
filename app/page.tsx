'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { MarketplaceHeader } from '@/components/marketplace-header'
import { NFTGrid } from '@/components/nft-grid'
import { AuctionGrid } from '@/components/auction-grid'
import { MintNFTModal } from '@/components/mint-nft-modal'
import { CreateAuctionModal } from '@/components/create-auction-modal'
import { BidModal } from '@/components/bid-modal'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useContract } from '@/hooks/useContract'
import { useNFT } from '@/hooks/useNFT'
import { useAuction } from '@/hooks/useAuction'
import { useToast } from '@/hooks/use-toast'
import { NFT, AuctionDisplay } from '@/types/contracts'
import { endAuction, cancelAuction } from '@/lib/contract'

export default function Home() {
  const { client, account, isConnected } = useContract()
  const { myNFTs, loading: nftLoading, refetch: refetchNFTs } = useNFT()
  const { 
    activeAuctions, 
    endedAuctions, 
    getMyAuctions, 
    getMyBids,
    loading: auctionLoading, 
    refetch: refetchAuctions 
  } = useAuction()
  const { toast } = useToast()

  const [mintModalOpen, setMintModalOpen] = useState(false)
  const [auctionModalOpen, setAuctionModalOpen] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [selectedAuction, setSelectedAuction] = useState<AuctionDisplay | null>(null)

  const myAuctions = account ? getMyAuctions(account.address) : []
  const myBids = account ? getMyBids(account.address) : []

  const handleCreateAuction = (nft: NFT) => {
    setSelectedNFT(nft)
    setAuctionModalOpen(true)
  }

  const handleBid = (auction: AuctionDisplay) => {
    setSelectedAuction(auction)
    setBidModalOpen(true)
  }

  const handleEndAuction = async (auction: AuctionDisplay) => {
    if (!client || !account) return

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      await endAuction(signer, auction.tokenId)

      toast({
        title: 'Auction Ended!',
        description: `Auction buat NFT #${auction.tokenId} udah selesai!`
      })

      refetchAuctions()
      refetchNFTs()
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'Gagal end auction',
        variant: 'destructive'
      })
    }
  }

  const handleCancelAuction = async (auction: AuctionDisplay) => {
    if (!client || !account) return

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      await cancelAuction(signer, auction.tokenId)

      toast({
        title: 'Auction Canceled',
        description: `Auction buat NFT #${auction.tokenId} dibatalin`
      })

      refetchAuctions()
      refetchNFTs()
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message || 'Gagal cancel auction',
        variant: 'destructive'
      })
    }
  }

  const handleModalSuccess = () => {
    refetchNFTs()
    refetchAuctions()
  }

  if (!isConnected) {
    return (
      <>
        <MarketplaceHeader />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-6xl">🔐</span>
              </div>
              <h2 className="text-3xl font-bold">Connect Wallet</h2>
              <p className="text-muted-foreground max-w-md">
                Connect wallet lo buat mulai mint NFT, create auction, atau bid di marketplace
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <MarketplaceHeader onMintClick={() => setMintModalOpen(true)} />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs defaultValue="my-nfts" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="my-nfts">
                My NFTs ({myNFTs.length})
              </TabsTrigger>
              <TabsTrigger value="active-auctions">
                Active Auctions ({activeAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="my-auctions">
                My Auctions ({myAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="my-bids">
                My Bids ({myBids.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-nfts" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">My NFTs</h2>
                <p className="text-muted-foreground">NFT collection lo</p>
              </div>
              <NFTGrid
                nfts={myNFTs}
                loading={nftLoading}
                onCreateAuction={handleCreateAuction}
              />
            </TabsContent>

            <TabsContent value="active-auctions" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Active Auctions</h2>
                <p className="text-muted-foreground">Semua auction yang lagi jalan</p>
              </div>
              <AuctionGrid
                auctions={activeAuctions}
                loading={auctionLoading}
                userAddress={account?.address}
                onBid={handleBid}
                onEnd={handleEndAuction}
                onCancel={handleCancelAuction}
              />
            </TabsContent>

            <TabsContent value="my-auctions" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">My Auctions</h2>
                <p className="text-muted-foreground">Auction yang lo buat</p>
              </div>
              <AuctionGrid
                auctions={myAuctions}
                loading={auctionLoading}
                userAddress={account?.address}
                onEnd={handleEndAuction}
                onCancel={handleCancelAuction}
              />
            </TabsContent>

            <TabsContent value="my-bids" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">My Bids</h2>
                <p className="text-muted-foreground">Auction yang lo bid</p>
              </div>
              <AuctionGrid
                auctions={myBids}
                loading={auctionLoading}
                userAddress={account?.address}
                onBid={handleBid}
                onEnd={handleEndAuction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MintNFTModal
        open={mintModalOpen}
        onOpenChange={setMintModalOpen}
        onSuccess={handleModalSuccess}
      />

      <CreateAuctionModal
        open={auctionModalOpen}
        onOpenChange={setAuctionModalOpen}
        nft={selectedNFT}
        onSuccess={handleModalSuccess}
      />

      <BidModal
        open={bidModalOpen}
        onOpenChange={setBidModalOpen}
        auction={selectedAuction}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}
