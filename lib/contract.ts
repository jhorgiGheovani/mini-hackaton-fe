import { liskSepolia } from 'panna-sdk'
import { prepareContractCall, sendTransaction, readContract, waitForReceipt } from 'thirdweb/transaction'
import { getContract } from 'thirdweb/contract'
import { toWei } from 'thirdweb/utils'
import { Auction } from '@/types/contracts'

export const BLOOM_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

export const BLOOM_NFT_ABI = [
  {
    "type": "function",
    "name": "mint",
    "inputs": [{"name": "ipfsHash", "type": "string"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "createAuction",
    "inputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "startingBid", "type": "uint256"},
      {"name": "durationInSecond", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "bid",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "endAuction",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelAuction",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAuction",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{
      "name": "",
      "type": "tuple",
      "components": [
        {"name": "tokenId", "type": "uint256"},
        {"name": "seller", "type": "address"},
        {"name": "startingBid", "type": "uint256"},
        {"name": "highestBid", "type": "uint256"},
        {"name": "highestBidder", "type": "address"},
        {"name": "startTime", "type": "uint256"},
        {"name": "endTime", "type": "uint256"},
        {"name": "active", "type": "bool"},
        {"name": "ended", "type": "bool"}
      ]
    }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isAuctionActive",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTimeRemaining",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenOfOwnerByIndex",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "index", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenByIndex",
    "inputs": [{"name": "index", "type": "uint256"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isInAuction",
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "biayaAdmin",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "adminFeePercentage",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAccumulatedFees",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  }
] as const

export async function mintNFT(client: any, account: any, ipfsHash: string, adminFee: string) {
  const tx = prepareContractCall({
    contract: getContract({
      client,
      chain: liskSepolia,
      address: BLOOM_NFT_CONTRACT_ADDRESS,
    }),
    method: 'function mint(string ipfsHash) payable returns (uint256)',
    params: [ipfsHash],
    value: toWei(adminFee),
  })

  const result = await sendTransaction({
    account,
    transaction: tx,
  })

  await waitForReceipt(result)
  return result
}

export async function createAuction(
  client: any,
  account: any,
  tokenId: bigint,
  startingBid: string,
  durationInSeconds: number
) {
  const tx = prepareContractCall({
    contract: getContract({
      client,
      chain: liskSepolia,
      address: BLOOM_NFT_CONTRACT_ADDRESS,
    }),
    method: 'function createAuction(uint256 tokenId, uint256 startingBid, uint256 durationInSecond)',
    params: [tokenId, toWei(startingBid), BigInt(durationInSeconds)],
  })

  const result = await sendTransaction({
    account,
    transaction: tx,
  })

  await waitForReceipt(result)
  return result
}

export async function placeBid(client: any, account: any, tokenId: bigint, bidAmount: string) {
  const tx = prepareContractCall({
    contract: getContract({
      client,
      chain: liskSepolia,
      address: BLOOM_NFT_CONTRACT_ADDRESS,
    }),
    method: 'function bid(uint256 tokenId) payable',
    params: [tokenId],
    value: toWei(bidAmount),
  })

  const result = await sendTransaction({
    account,
    transaction: tx,
  })

  await waitForReceipt(result)
  return result
}

export async function endAuction(client: any, account: any, tokenId: bigint) {
  const tx = prepareContractCall({
    contract: getContract({
      client,
      chain: liskSepolia,
      address: BLOOM_NFT_CONTRACT_ADDRESS,
    }),
    method: 'function endAuction(uint256 tokenId)',
    params: [tokenId],
  })

  const result = await sendTransaction({
    account,
    transaction: tx,
  })

  await waitForReceipt(result)
  return result
}

export async function cancelAuction(client: any, account: any, tokenId: bigint) {
  const tx = prepareContractCall({
    contract: getContract({
      client,
      chain: liskSepolia,
      address: BLOOM_NFT_CONTRACT_ADDRESS,
    }),
    method: 'function cancelAuction(uint256 tokenId)',
    params: [tokenId],
  })

  const result = await sendTransaction({
    account,
    transaction: tx,
  })

  await waitForReceipt(result)
  return result
}

export function parseAuctionData(rawAuction: any): Auction {
  const isArray = Array.isArray(rawAuction)
  
  return {
    tokenId: Number(isArray ? rawAuction[0] ?? 0 : rawAuction.tokenId ?? 0),
    seller: isArray ? rawAuction[1] ?? '' : rawAuction.seller ?? '',
    startingBid: BigInt(isArray ? rawAuction[2] ?? 0 : rawAuction.startingBid ?? 0),
    highestBid: BigInt(isArray ? rawAuction[3] ?? 0 : rawAuction.highestBid ?? 0),
    highestBidder: isArray ? rawAuction[4] ?? '' : rawAuction.highestBidder ?? '',
    startTime: BigInt(isArray ? rawAuction[5] ?? 0 : rawAuction.startTime ?? 0),
    endTime: BigInt(isArray ? rawAuction[6] ?? 0 : rawAuction.endTime ?? 0),
    active: Boolean(isArray ? rawAuction[7] ?? false : rawAuction.active ?? false),
    ended: Boolean(isArray ? rawAuction[8] ?? false : rawAuction.ended ?? false),
  }
}

export async function getAuction(client: any, tokenId: bigint): Promise<Auction> {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: BLOOM_NFT_CONTRACT_ADDRESS,
  })

  const rawAuction = await readContract({
    contract,
    method: 'function getAuction(uint256 tokenId) view returns (uint256 tokenId, address seller, uint256 startingBid, uint256 highestBid, address highestBidder, uint256 startTime, uint256 endTime, bool active, bool ended)',
    params: [tokenId],
  })

  return parseAuctionData(rawAuction)
}

export async function getNFTMetadata(client: any, tokenId: bigint) {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: BLOOM_NFT_CONTRACT_ADDRESS,
  })

  const uri = await readContract({
    contract,
    method: 'function tokenURI(uint256 tokenId) view returns (string)',
    params: [tokenId],
  })

  const owner = await readContract({
    contract,
    method: 'function ownerOf(uint256 tokenId) view returns (address)',
    params: [tokenId],
  })

  const isInAuction = await readContract({
    contract,
    method: 'function isInAuction(uint256 tokenId) view returns (bool)',
    params: [tokenId],
  })

  return { uri, owner, isInAuction }
}

export async function getNFTsByOwner(client: any, ownerAddress: string): Promise<bigint[]> {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: BLOOM_NFT_CONTRACT_ADDRESS,
  })

  const balance = await readContract({
    contract,
    method: 'function balanceOf(address owner) view returns (uint256)',
    params: [ownerAddress],
  })

  const nfts: bigint[] = []
  
  for (let i = 0; i < Number(balance); i++) {
    const tokenId = await readContract({
      contract,
      method: 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
      params: [ownerAddress, BigInt(i)],
    })
    nfts.push(BigInt(tokenId))
  }

  return nfts
}

export async function getTotalSupply(client: any): Promise<bigint> {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: BLOOM_NFT_CONTRACT_ADDRESS,
  })

  return BigInt(
    await readContract({
      contract,
      method: 'function totalSupply() view returns (uint256)',
      params: [],
    })
  )
}

export async function getAdminFee(client: any): Promise<bigint> {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: BLOOM_NFT_CONTRACT_ADDRESS,
  })

  return BigInt(
    await readContract({
      contract,
      method: 'function biayaAdmin() view returns (uint256)',
      params: [],
    })
  )
}

export function convertToIPFSGateway(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
  }
  if (uri.startsWith('Qm') || uri.startsWith('baf')) {
    return `https://gateway.pinata.cloud/ipfs/${uri}`
  }
  return uri
}

export function formatEther(wei: bigint): string {
  const ethValue = Number(wei) / 1e18
  return ethValue.toFixed(4).replace(/\.?0+$/, '')
}
