'use client'

import { useState, useEffect, useCallback } from 'react'
import { useContract } from './useContract'
import { NFT, NFTMetadata } from '@/types/contracts'
import { getNFTsByOwner, getNFTMetadata, getTotalSupply, convertToIPFSGateway, getAuction } from '@/lib/contract'

export function useNFT() {
  const { client, account, isConnected } = useContract()
  const [myNFTs, setMyNFTs] = useState<NFT[]>([])
  const [allNFTs, setAllNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTMetadata = async (ipfsUrl: string): Promise<NFTMetadata | null> => {
    try {
      const gatewayUrl = convertToIPFSGateway(ipfsUrl)
      console.log('Fetching metadata from:', gatewayUrl)
      const response = await fetch(gatewayUrl)
      if (!response.ok) return null
      return await response.json()
    } catch (err) {
      console.error('Error fetching NFT metadata:', err)
      return null
    }
  }

  const loadNFTData = async (tokenId: bigint): Promise<NFT | null> => {
    if (!client) return null

    try {
      const { uri, owner, isInAuction } = await getNFTMetadata(client, tokenId)
      const metadata = await fetchNFTMetadata(uri)
      
      const imageUrl = metadata?.image 
        ? convertToIPFSGateway(metadata.image)
        : '/placeholder.svg'
      
      let hasEndedAuction = false
      try {
        const auctionData = await getAuction(client, tokenId)
        hasEndedAuction = auctionData.ended === true
      } catch (err) {
        console.log(`No auction data for NFT ${tokenId}`)
      }
      
      return {
        tokenId: Number(tokenId),
        owner,
        ipfsHash: uri,
        imageUrl,
        isInAuction,
        hasEndedAuction,
        metadata: metadata || undefined
      }
    } catch (err) {
      console.error(`Error loading NFT ${tokenId}:`, err)
      return null
    }
  }

  const fetchMyNFTs = useCallback(async () => {
    if (!isConnected || !account?.address || !client) return

    setLoading(true)
    setError(null)

    try {
      const tokenIds = await getNFTsByOwner(client, account.address)
      console.log('Found NFTs for user:', tokenIds)
      
      const nftsData = await Promise.all(
        tokenIds.map(tokenId => loadNFTData(tokenId))
      )
      
      setMyNFTs(nftsData.filter((nft): nft is NFT => nft !== null))
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NFTs')
      console.error('Error fetching my NFTs:', err)
    } finally {
      setLoading(false)
    }
  }, [isConnected, account?.address, client])

  const fetchAllNFTs = useCallback(async () => {
    if (!client) return

    setLoading(true)
    setError(null)

    try {
      const totalSupply = await getTotalSupply(client)
      const total = Number(totalSupply)
      console.log('Total NFTs minted:', total)
      
      if (total === 0) {
        console.log('Belum ada NFT yang di-mint')
        setAllNFTs([])
        setLoading(false)
        return
      }
      
      const nftsData = await Promise.all(
        Array.from({ length: total }, (_, i) => loadNFTData(BigInt(i + 1)))
      )
      
      setAllNFTs(nftsData.filter((nft): nft is NFT => nft !== null))
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all NFTs')
      console.error('Error fetching all NFTs:', err)
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    if (isConnected) {
      fetchMyNFTs()
    }
  }, [isConnected, fetchMyNFTs])

  return {
    myNFTs,
    allNFTs,
    loading,
    error,
    refetch: fetchMyNFTs,
    fetchAllNFTs
  }
}

