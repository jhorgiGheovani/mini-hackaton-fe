// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
//100000000000000 = 0.0001 ether
//100000000000100
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract BloomNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ERC721Burnable, ReentrancyGuard, IERC721Receiver {
    uint256 private _nextTokenId;
    string public basePinataGateway = "https://gateway.pinata.cloud/ipfs/";
    uint256 public biayaAdmin = 0.001 ether; 
    // uint256 ONE_DAY = 24 * 60 * 60; 
    // uint256 ONE_MINUTE = 60;
    // uint256 duration = 1 * ONE_MINUTE;

    // Admin fee configuration
    uint256 public adminFeePercentage = 250; // 2.5% (basis point: 250/10000)
    uint256 public accumulatedAdminFees = 0;
    uint256 public constant MAX_ADMIN_FEE = 1000; // Max 10%

    // Auction structs
    struct Auction {
        uint256 tokenId;
        address seller;
        uint256 startingBid;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool ended;
    }

    mapping(uint256 => Auction) public auctions; // tokenId => Auction
    mapping(uint256 => bool) public isInAuction;  // tokenId => bool

    event NFTMinted(uint256 indexed tokenId, address indexed creator, string ipfsHash);
    event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingBid, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);
    event AuctionCanceled(uint256 indexed tokenId);
    event AdminFeeUpdated(uint256 newFeePercentage);
    event AdminFeeWithdrawn(address indexed recipient, uint256 amount);

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(msg.sender) 
    {
        _nextTokenId = 1;
    }
    
        function onERC721Received(
        address,  // operator
        address,  // from
        uint256,  // tokenId
        bytes calldata  // data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setBasePinataGateway(string memory newBase) public onlyOwner {
        basePinataGateway = newBase;
    }

    // --- Minting (NFT goes to CONTRACT, not user) ---
    function mint(string memory ipfsHash) external payable returns (uint256) {
        require(msg.value >= biayaAdmin, "Mohon masukan biaya admin minimal 0.001 ether");
        
        accumulatedAdminFees += msg.value; 

        uint256 id = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(address(this), id);
        _setTokenURI(id, ipfsHash);
        
        emit NFTMinted(id, msg.sender, ipfsHash);
        return id;
    }

    // --- Auction Functions ---
    
    // Create auction (only contract owner or NFT is already in contract)
    function createAuction(
        uint256 tokenId,
        uint256 startingBid,
        uint256 durationInSecond
    ) external {
        require(ownerOf(tokenId) == address(this), "NFT not in contract");
        require(!isInAuction[tokenId], "Already in auction");
        // require(duration > 0, "Invalid duration");
        require(startingBid > 0, "Starting bid must be > 0");

        uint256 endTime = block.timestamp + durationInSecond;

        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            startingBid: startingBid,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: endTime,
            active: true,
            ended: false
        });

        isInAuction[tokenId] = true;

        emit AuctionCreated(tokenId, msg.sender, startingBid, endTime);
    }

    // Place bid
    function bid(uint256 tokenId) external payable nonReentrant {
        Auction storage auction = auctions[tokenId];
        
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(msg.value >= auction.startingBid, "Bid below starting price");
        require(msg.value > auction.highestBid, "Bid too low");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    // End auction and transfer NFT to winner
    function endAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(!auction.ended, "Auction already ended");

        auction.active = false;
        auction.ended = true;
        isInAuction[tokenId] = false;

        if (auction.highestBidder != address(0)) {
            // Calculate admin fee
            uint256 adminFee = (auction.highestBid * adminFeePercentage) / 10000;
            uint256 sellerAmount = auction.highestBid - adminFee;
            
            // Accumulate admin fee
            accumulatedAdminFees += adminFee;
            
            // Transfer NFT from contract to winner
            _transfer(address(this), auction.highestBidder, tokenId);

            // Transfer payment to seller (minus admin fee)
            payable(auction.seller).transfer(sellerAmount);

            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        } else {
            // No bids - transfer NFT to seller
            _transfer(address(this), auction.seller, tokenId);
            
            emit AuctionEnded(tokenId, auction.seller, 0);
        }
    }

    // Cancel auction (only if no bids yet)
    function cancelAuction(uint256 tokenId) external {
        Auction storage auction = auctions[tokenId];
        
        require(auction.active, "Auction not active");
        require(msg.sender == auction.seller || msg.sender == owner(), "Not authorized");
        require(auction.highestBidder == address(0), "Cannot cancel, bids exist");

        auction.active = false;
        auction.ended = true;
        isInAuction[tokenId] = false;

        // Return NFT to seller
        _transfer(address(this), auction.seller, tokenId);

        emit AuctionCanceled(tokenId);
    }

    // Get auction info
    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return auctions[tokenId];
    }

    // Check if auction is still active
    function isAuctionActive(uint256 tokenId) external view returns (bool) {
        Auction memory auction = auctions[tokenId];
        return auction.active && block.timestamp < auction.endTime;
    }

    // Get time remaining
    function getTimeRemaining(uint256 tokenId) external view returns (uint256) {
        Auction memory auction = auctions[tokenId];
        if (!auction.active || block.timestamp >= auction.endTime) {
            return 0;
        }
        return auction.endTime - block.timestamp;
    }

    // --- Override functions for ERC721 compatibility ---
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        // Prevent transfer if in active auction
        if (isInAuction[tokenId]) {
            require(
                msg.sender == address(this) || 
                auth == address(this),
                "NFT locked in auction"
            );
        }
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        string memory storedURI = super.tokenURI(tokenId);
        return string(abi.encodePacked(basePinataGateway, storedURI));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Set admin fee percentage (only owner)
    function setAdminFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= MAX_ADMIN_FEE, "Fee too high");
        adminFeePercentage = newFeePercentage;
        emit AdminFeeUpdated(newFeePercentage);
    }

    // Withdraw accumulated admin fees
    function withdrawAdminFees() external onlyOwner {
        uint256 amount = accumulatedAdminFees;
        require(amount > 0, "No admin fees to withdraw");
        
        accumulatedAdminFees = 0;
        payable(owner()).transfer(amount);
        
        emit AdminFeeWithdrawn(owner(), amount);
    }

    // View function to see accumulated fees
    function getAccumulatedFees() external view returns (uint256) {
        return accumulatedAdminFees;
    }
}