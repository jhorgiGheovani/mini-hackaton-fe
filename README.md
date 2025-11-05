# Bloom NFT Marketplace

NFT Auction Marketplace yang dibangun dengan Next.js, TypeScript, dan Panna SDK untuk Lisk blockchain.

![Panna SDK](https://img.shields.io/badge/Panna--SDK-0.1.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-cyan)

## Features

- 🎨 **Mint NFTs** - Mint NFT lo dengan IPFS hash
- 🔨 **Create Auctions** - Buat auction untuk NFT lo
- 💰 **Place Bids** - Bid di auction yang aktif
- 🏆 **End Auctions** - Finalize auction dan transfer NFT ke winner
- ⏱️ **Real-time Countdown** - Live countdown timer buat setiap auction
- 📱 **Responsive Design** - Mobile-friendly UI
- 🌓 **Dark Mode** - Dark/light theme support

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **Web3 SDK**: Panna SDK 0.1.0
- **Blockchain**: Lisk Sepolia Testnet
- **Smart Contract**: BloomNFT (ERC-721)
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Smart Contract

BloomNFT contract features:
- ERC-721 NFT standard
- Auction system with time-based bidding
- Admin fee collection (2.5% default)
- IPFS metadata support via Pinata gateway
- Reentrancy protection

### Main Functions
- `mint(ipfsHash)` - Mint NFT baru
- `createAuction(tokenId, startingBid, duration)` - Buat auction
- `bid(tokenId)` - Place bid
- `endAuction(tokenId)` - End auction dan transfer NFT
- `cancelAuction(tokenId)` - Cancel auction (kalo belum ada bid)

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn atau npm
- MetaMask atau wallet lain yang support
- Lisk Sepolia testnet ETH

### Installation

```bash
yarn install
```

### Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_PANNA_CLIENT_ID=your_client_id
NEXT_PUBLIC_PANNA_PARTNER_ID=your_partner_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

**Note**: Ganti semua value dengan credentials lo sendiri

### Run Development Server

```bash
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx              # Main marketplace page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── marketplace-header.tsx
│   ├── nft-card.tsx
│   ├── auction-card.tsx
│   ├── nft-grid.tsx
│   ├── auction-grid.tsx
│   ├── mint-nft-modal.tsx
│   ├── create-auction-modal.tsx
│   ├── bid-modal.tsx
│   └── ui/                   # Shadcn UI components
├── hooks/
│   ├── useContract.ts        # Panna SDK integration
│   ├── useNFT.ts            # NFT data fetching
│   └── useAuction.ts        # Auction data fetching
├── lib/
│   ├── contract.ts          # Contract ABI & functions
│   └── utils.ts             # Utility functions
└── types/
    └── contracts.ts         # TypeScript types
```

## Usage

### 1. Connect Wallet
Klik "Connect Wallet" di header

### 2. Mint NFT
1. Upload gambar lo ke IPFS (Pinata, NFT.storage, dll)
2. Klik "Mint NFT"
3. Masukin IPFS hash/CID
4. Bayar 0.001 ETH admin fee
5. Confirm transaction

### 3. Create Auction
1. Pilih NFT lo dari "My NFTs" tab
2. Klik "Create Auction"
3. Set starting bid dan durasi
4. Confirm transaction

### 4. Place Bid
1. Browse "Active Auctions"
2. Klik "Place Bid"
3. Masukin bid amount (harus lebih tinggi dari current bid)
4. Confirm transaction

### 5. End Auction
- Setelah auction selesai, seller atau highest bidder bisa klik "End Auction"
- NFT akan otomatis ditransfer ke winner
- Payment dikurangi admin fee (2.5%) dikirim ke seller

## License

MIT

## Credits

Built with ❤️ menggunakan Panna SDK dan Lisk blockchain
