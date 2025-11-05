'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useContract } from './useContract'
import { NFT, NFTMetadata } from '@/types/contracts'
import { getNFTsByOwner, getNFTMetadata, getTotalSupply } from '@/lib/contract'

export function useNFT() {
  const { client, account, isConnected } = useContract()
  const [myNFTs, setMyNFTs] = useState<NFT[]>([])
  const [allNFTs, setAllNFTs] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTMetadata = async (ipfsUrl: string): Promise<NFTMetadata | null> => {
    try {
      const response = await fetch(ipfsUrl)
      if (!response.ok) return null
      return await response.json()
    } catch (err) {
      console.error('Error fetching NFT metadata:', err)
      return null
    }
  }

  const loadNFTData = async (tokenId: number, provider: ethers.Provider): Promise<NFT | null> => {
    try {
      const { uri, owner, isInAuction } = await getNFTMetadata(provider, tokenId)
      const metadata = await fetchNFTMetadata(uri)
      
      return {
        tokenId,
        owner,
        ipfsHash: uri,
        imageUrl: metadata?.image || uri,
        isInAuction,
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
      // Get provider properly from Panna client
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const tokenIds = await getNFTsByOwner(provider, account.address)
      
      const nftsData = await Promise.all(
        tokenIds.map(tokenId => loadNFTData(tokenId, provider))
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
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const totalSupply = await getTotalSupply(provider)
      const total = Number(totalSupply)
      
      const nftsData = await Promise.all(
        Array.from({ length: total }, (_, i) => loadNFTData(i + 1, provider))
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

