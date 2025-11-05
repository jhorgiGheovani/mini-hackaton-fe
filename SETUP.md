# Setup Guide - Bloom NFT Marketplace

## Quick Start

### 1. Install Dependencies
```bash
yarn install
```

### 2. Deploy Smart Contract
Deploy `smartcontract..txt` ke Lisk Sepolia testnet menggunakan:
- Remix IDE
- Hardhat
- Foundry

### 3. Setup Environment Variables
Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_PANNA_CLIENT_ID=your_panna_client_id
NEXT_PUBLIC_PANNA_PARTNER_ID=your_panna_partner_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

**PENTING**: Ganti `0xYourDeployedContractAddress` dengan contract address yang lo deploy!

### 4. Run Development Server
```bash
yarn dev
```

Buka http://localhost:3000

## File Structure Changes

### ✅ File Baru
- `components/nft-card.tsx` - NFT card component
- `components/auction-card.tsx` - Auction card dengan countdown
- `components/nft-grid.tsx` - Grid layout buat NFTs
- `components/auction-grid.tsx` - Grid layout buat auctions
- `components/mint-nft-modal.tsx` - Modal buat mint NFT
- `components/create-auction-modal.tsx` - Modal buat create auction
- `components/bid-modal.tsx` - Modal buat place bid
- `components/marketplace-header.tsx` - Header buat marketplace
- `components/ui/badge.tsx` - Badge component
- `components/ui/tabs.tsx` - Tabs component
- `hooks/useNFT.ts` - Hook buat NFT operations
- `hooks/useAuction.ts` - Hook buat auction operations
- `types/contracts.ts` - TypeScript types buat NFT & Auction

### 🔄 File Diupdate
- `app/page.tsx` - Main page dengan tabs system
- `lib/contract.ts` - BloomNFT contract functions
- `package.json` - Updated name
- `README.md` - Documentation baru

### ❌ File Dihapus (Garden-related)
- `components/garden-grid.tsx`
- `components/garden-header.tsx`
- `components/plant-card.tsx`
- `components/plant-details-modal.tsx`
- `components/plant-seed-modal.tsx`
- `components/stats-sidebar.tsx`
- `hooks/usePlants.ts`
- `hooks/usePlantStageScheduler.ts`

## Testing Checklist

### Connect Wallet
- [ ] Connect wallet via Panna SDK
- [ ] Check wallet address appears in header

### Mint NFT
- [ ] Upload image ke IPFS (Pinata/NFT.storage)
- [ ] Copy IPFS hash (Qm... atau bafy...)
- [ ] Klik "Mint NFT" button
- [ ] Masukin IPFS hash
- [ ] Confirm transaction dengan 0.001 ETH fee
- [ ] Check NFT muncul di "My NFTs" tab

### Create Auction
- [ ] Select NFT dari "My NFTs"
- [ ] Klik "Create Auction"
- [ ] Set starting bid (misal 0.01 ETH)
- [ ] Set duration (misal 1 Day)
- [ ] Confirm transaction
- [ ] Check auction muncul di "Active Auctions"

### Place Bid
- [ ] Go to "Active Auctions"
- [ ] Select auction (bukan auction lo sendiri)
- [ ] Klik "Place Bid"
- [ ] Masukin bid amount > current bid
- [ ] Confirm transaction
- [ ] Check bid lo jadi highest bid

### End Auction
- [ ] Wait sampe auction selesai (atau set duration 1 hour buat testing)
- [ ] Klik "End Auction" (seller atau winner)
- [ ] Confirm transaction
- [ ] Check NFT transferred ke winner
- [ ] Check auction muncul di ended state

## Troubleshooting

### Contract Address Not Set
Error: `call revert exception`
Fix: Update `BLOOM_NFT_CONTRACT_ADDRESS` di `lib/contract.ts`

### Insufficient Funds
Error: `insufficient funds for gas`
Fix: Top up Lisk Sepolia ETH dari faucet

### IPFS Image Not Loading
Error: Image ga muncul
Fix: 
- Check IPFS hash valid
- Test URL: `https://gateway.pinata.cloud/ipfs/YOUR_HASH`
- Tunggu beberapa saat, IPFS kadang butuh waktu

### Panna SDK Not Working
Error: `Cannot read properties of null`
Fix:
- Check `.env.local` file exists
- Check `NEXT_PUBLIC_PANNA_CLIENT_ID` dan `NEXT_PUBLIC_PANNA_PARTNER_ID` valid
- Restart dev server

## Next Steps

1. Deploy smart contract ke Lisk Sepolia
2. Update contract address
3. Setup environment variables
4. Test semua fitur
5. Customize UI sesuai brand lo
6. Deploy ke Vercel/Netlify

## Support

Kalo ada issue, check:
- Console logs (F12 > Console)
- Network tab (F12 > Network)
- Transaction di block explorer
- Smart contract events

Good luck! 🚀

