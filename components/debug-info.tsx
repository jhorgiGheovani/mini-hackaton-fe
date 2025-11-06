'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BLOOM_NFT_CONTRACT_ADDRESS } from '@/lib/contract'

export function DebugInfo() {
  const [networkInfo, setNetworkInfo] = useState<{
    name: string
    chainId: number
    contractAddress: string
    hasCode: boolean
  } | null>(null)

  useEffect(() => {
    async function checkNetwork() {
      try {
        if (typeof window === 'undefined' || !(window as any).ethereum) return

        const provider = (window as any).ethereum
        const chainIdHex = await provider.request({ method: 'eth_chainId' })
        const chainId = parseInt(chainIdHex, 16)
        
        const code = await provider.request({
          method: 'eth_getCode',
          params: [BLOOM_NFT_CONTRACT_ADDRESS, 'latest']
        })
        
        setNetworkInfo({
          name: chainId === 4202 ? 'Lisk Sepolia' : `Chain ${chainId}`,
          chainId,
          contractAddress: BLOOM_NFT_CONTRACT_ADDRESS,
          hasCode: code !== '0x'
        })
      } catch (err) {
        console.error('Error checking network:', err)
      }
    }

    checkNetwork()
  }, [])

  if (!networkInfo) return null

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Network:</span>
          <Badge variant="outline">{networkInfo.name} (Chain ID: {networkInfo.chainId})</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contract:</span>
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {networkInfo.contractAddress.slice(0, 6)}...{networkInfo.contractAddress.slice(-4)}
          </code>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={networkInfo.hasCode ? "default" : "destructive"}>
            {networkInfo.hasCode ? '✓ Contract Found' : '✗ No Contract'}
          </Badge>
        </div>
        {!networkInfo.hasCode && (
          <div className="text-red-500 text-xs mt-2 p-2 bg-red-50 rounded">
            ⚠️ Contract gak ketemu di network ini. Pastikan:
            <ul className="ml-4 mt-1 list-disc">
              <li>Contract address di .env udah bener</li>
              <li>Lo connect ke network yang sama pas deploy contract</li>
              <li>Contract udah di-deploy</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

