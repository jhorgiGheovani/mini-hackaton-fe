'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useContract } from './useContract'
import { Auction, AuctionDisplay } from '@/types/contracts'
import { getAuction, getTotalSupply, getNFTMetadata } from '@/lib/contract'

export function useAuction() {
  const { client, isConnected } = useContract()
  const [auctions, setAuctions] = useState<AuctionDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const convertAuctionToDisplay = (auction: Auction): AuctionDisplay => {
    return {
      ...auction,
      startingBid: ethers.formatEther(auction.startingBid),
      highestBid: ethers.formatEther(auction.highestBid),
      startTime: Number(auction.startTime),
      endTime: Number(auction.endTime),
      timeRemaining: Math.max(0, Number(auction.endTime) - Math.floor(Date.now() / 1000))
    }
  }

  const fetchAuctions = useCallback(async () => {
    if (!client) return

    setLoading(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const totalSupply = await getTotalSupply(provider)
      const total = Number(totalSupply)
      
      const auctionsData: AuctionDisplay[] = []
      
      for (let tokenId = 1; tokenId <= total; tokenId++) {
        try {
          const auctionData = await getAuction(provider, tokenId)
          
          if (auctionData.active || auctionData.ended) {
            const displayAuction = convertAuctionToDisplay(auctionData)
            
            const { uri, isInAuction } = await getNFTMetadata(provider, tokenId)
            
            try {
              const response = await fetch(uri)
              const metadata = await response.json()
              
              displayAuction.nft = {
                tokenId,
                owner: auctionData.seller,
                ipfsHash: uri,
                imageUrl: metadata.image || uri,
                isInAuction,
                metadata
              }
            } catch (err) {
              displayAuction.nft = {
                tokenId,
                owner: auctionData.seller,
                ipfsHash: uri,
                imageUrl: uri,
                isInAuction
              }
            }
            
            auctionsData.push(displayAuction)
          }
        } catch (err) {
          console.error(`Error loading auction for token ${tokenId}:`, err)
        }
      }
      
      setAuctions(auctionsData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch auctions')
      console.error('Error fetching auctions:', err)
    } finally {
      setLoading(false)
    }
  }, [client])

  const getActiveAuctions = useCallback(() => {
    const now = Math.floor(Date.now() / 1000)
    return auctions.filter(auction => auction.active && auction.endTime > now)
  }, [auctions])

  const getEndedAuctions = useCallback(() => {
    return auctions.filter(auction => auction.ended || !auction.active)
  }, [auctions])

  const getMyAuctions = useCallback((address: string) => {
    if (!address) return []
    return auctions.filter(
      auction => auction.seller?.toLowerCase() === address.toLowerCase()
    )
  }, [auctions])

  const getMyBids = useCallback((address: string) => {
    if (!address) return []
    return auctions.filter(
      auction => auction.highestBidder?.toLowerCase() === address.toLowerCase()
    )
  }, [auctions])

  useEffect(() => {
    if (isConnected) {
      fetchAuctions()
      const interval = setInterval(fetchAuctions, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, fetchAuctions])

  return {
    auctions,
    activeAuctions: getActiveAuctions(),
    endedAuctions: getEndedAuctions(),
    getMyAuctions,
    getMyBids,
    loading,
    error,
    refetch: fetchAuctions
  }
}

