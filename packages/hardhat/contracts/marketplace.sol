// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Interface for the ERC20 token, in our case cUSD
interface IERC20Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Contract for the marketplace
contract Marketplace {
    uint256 internal productsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    mapping(uint256 => Product) internal products;
    mapping(address => mapping(uint256 => bool)) internal userProductRatingStatus;

    // Structure for a product
    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint256 price;
        uint256 sold;
        uint256 availableItems;
    }

    event ProductAdded(address indexed owner, uint256 indexed index);
    event ProductSold(uint256 indexed index, address indexed buyer);

    function writeProduct(
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _location,
        uint256 _price,
        uint256 _availableItems
    ) external {
        require(_price > 0, "Price must be greater than zero");

        Product storage newProduct = products[productsLength];
        newProduct.owner = payable(msg.sender);
        newProduct.name = _name;
        newProduct.image = _image;
        newProduct.description = _description;
        newProduct.location = _location;
        newProduct.price = _price;
        newProduct.availableItems = _availableItems;

        emit ProductAdded(msg.sender, productsLength);

        productsLength++;
    }

    function readProduct(uint256 _index) external view returns (Product memory) {
        require(_index < productsLength, "Invalid product index");

        return products[_index];
    }

    function buyProduct(uint256 _index) external payable {
        require(_index < productsLength, "Invalid product index");

        Product storage product = products[_index];
        require(product.availableItems > 0, "Item sold out");
        require(product.price == msg.value, "Incorrect amount of Ether sent");

        require(IERC20Token(cUsdTokenAddress).transferFrom(msg.sender, product.owner, product.price), "Transfer failed");

        product.availableItems--;
        product.sold++;

        emit ProductSold(_index, msg.sender);
    }

    function getProductsLength() external view returns (uint256) {
        return productsLength;
    }
}
