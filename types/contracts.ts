export interface NFT {
  tokenId: number
  owner: string
  ipfsHash: string
  imageUrl: string
  isInAuction: boolean
  metadata?: NFTMetadata
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export interface Auction {
  tokenId: number
  seller: string
  startingBid: bigint
  highestBid: bigint
  highestBidder: string
  startTime: bigint
  endTime: bigint
  active: boolean
  ended: boolean
}

export interface AuctionDisplay extends Omit<Auction, 'startingBid' | 'highestBid' | 'startTime' | 'endTime'> {
  startingBid: string
  highestBid: string
  startTime: number
  endTime: number
  timeRemaining: number
  nft?: NFT
}

export enum AuctionStatus {
  ACTIVE = 'active',
  ENDING_SOON = 'ending_soon',
  ENDED = 'ended',
  NO_BIDS = 'no_bids'
}

export interface ContractConfig {
  address: string
  chainId: number
  adminFee: string
  adminFeePercentage: number
}
