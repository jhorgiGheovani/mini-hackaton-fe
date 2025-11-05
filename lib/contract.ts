import { ethers } from 'ethers'
import { liskSepolia } from 'panna-sdk'

// BloomNFT Contract Address on Lisk Sepolia
export const BLOOM_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

// BloomNFT Contract ABI
export const BLOOM_NFT_ABI = [
  "function mint(string memory ipfsHash) external payable returns (uint256)",
  "function createAuction(uint256 tokenId, uint256 startingBid, uint256 durationInSecond) external",
  "function bid(uint256 tokenId) external payable",
  "function endAuction(uint256 tokenId) external",
  "function cancelAuction(uint256 tokenId) external",
  "function getAuction(uint256 tokenId) external view returns (tuple(uint256 tokenId, address seller, uint256 startingBid, uint256 highestBid, address highestBidder, uint256 startTime, uint256 endTime, bool active, bool ended))",
  "function isAuctionActive(uint256 tokenId) external view returns (bool)",
  "function getTimeRemaining(uint256 tokenId) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function isInAuction(uint256 tokenId) external view returns (bool)",
  "function biayaAdmin() external view returns (uint256)",
  "function adminFeePercentage() external view returns (uint256)",
  "function getAccumulatedFees() external view returns (uint256)",
  "event NFTMinted(uint256 indexed tokenId, address indexed creator, string ipfsHash)",
  "event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingBid, uint256 endTime)",
  "event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount)",
  "event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount)",
  "event AuctionCanceled(uint256 indexed tokenId)"
]

export async function getBloomNFTContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    BLOOM_NFT_CONTRACT_ADDRESS,
    BLOOM_NFT_ABI,
    signerOrProvider
  )
}

// Helper to get provider from Panna client
export function getProviderFromClient(client: any) {
  if (!client) throw new Error('Client not available')
  
  // Panna SDK client already has ethereum provider interface
  if (client.request) {
    return new ethers.BrowserProvider(client)
  }
  
  // Fallback if client structure is different
  if (client.provider) {
    return new ethers.BrowserProvider(client.provider)
  }
  
  throw new Error('Invalid client structure')
}

// Mint NFT with IPFS hash
export async function mintNFT(
  signer: ethers.Signer,
  ipfsHash: string,
  adminFee: string
) {
  const contract = await getBloomNFTContract(signer)
  const tx = await contract.mint(ipfsHash, {
    value: ethers.parseEther(adminFee)
  })
  const receipt = await tx.wait()
  
  const mintEvent = receipt.logs.find(
    (log: any) => log.fragment && log.fragment.name === 'NFTMinted'
  )
  
  return {
    transactionHash: receipt.hash,
    tokenId: mintEvent ? mintEvent.args[0] : null
  }
}

// Create auction for NFT
export async function createAuction(
  signer: ethers.Signer,
  tokenId: number,
  startingBid: string,
  durationInSeconds: number
) {
  const contract = await getBloomNFTContract(signer)
  const tx = await contract.createAuction(
    tokenId,
    ethers.parseEther(startingBid),
    durationInSeconds
  )
  const receipt = await tx.wait()
  return receipt
}

// Place bid on auction
export async function placeBid(
  signer: ethers.Signer,
  tokenId: number,
  bidAmount: string
) {
  const contract = await getBloomNFTContract(signer)
  const tx = await contract.bid(tokenId, {
    value: ethers.parseEther(bidAmount)
  })
  const receipt = await tx.wait()
  return receipt
}

// End auction
export async function endAuction(
  signer: ethers.Signer,
  tokenId: number
) {
  const contract = await getBloomNFTContract(signer)
  const tx = await contract.endAuction(tokenId)
  const receipt = await tx.wait()
  return receipt
}

// Cancel auction
export async function cancelAuction(
  signer: ethers.Signer,
  tokenId: number
) {
  const contract = await getBloomNFTContract(signer)
  const tx = await contract.cancelAuction(tokenId)
  const receipt = await tx.wait()
  return receipt
}

// Get auction info
export async function getAuction(
  provider: ethers.Provider,
  tokenId: number
) {
  const contract = await getBloomNFTContract(provider)
  return await contract.getAuction(tokenId)
}

// Get NFT metadata
export async function getNFTMetadata(
  provider: ethers.Provider,
  tokenId: number
) {
  const contract = await getBloomNFTContract(provider)
  const uri = await contract.tokenURI(tokenId)
  const owner = await contract.ownerOf(tokenId)
  const isInAuction = await contract.isInAuction(tokenId)
  
  return { uri, owner, isInAuction }
}

// Get all NFTs owned by address
export async function getNFTsByOwner(
  provider: ethers.Provider,
  ownerAddress: string
) {
  const contract = await getBloomNFTContract(provider)
  const balance = await contract.balanceOf(ownerAddress)
  const nfts = []
  
  for (let i = 0; i < Number(balance); i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i)
    nfts.push(Number(tokenId))
  }
  
  return nfts
}

// Get total supply of NFTs
export async function getTotalSupply(provider: ethers.Provider) {
  const contract = await getBloomNFTContract(provider)
  return await contract.totalSupply()
}

// Get admin fee
export async function getAdminFee(provider: ethers.Provider) {
  const contract = await getBloomNFTContract(provider)
  return await contract.biayaAdmin()
}
