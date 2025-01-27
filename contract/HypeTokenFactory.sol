// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./HypeTokenV3.sol"; // Import the HypeToken contract

contract HypeTokenFactory is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{

    address[] public deployedTokens;
   

    event TokenCreated(
        address tokenAddress,
        string name,
        string symbol,
        string description,
        string image,
        string twitter,
        string telegram,
        string website,
        address developer
    );

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    /**
     * @dev Create a new token with the specified parameters.
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory description,
        string memory image,
        string memory twitter,
        string memory telegram,
        string memory website
    ) public {

        // Deploy a new HypeToken contract
        HypeTokenV3 newToken = new HypeTokenV3();
        newToken.initialize(
            name,
            symbol,
            msg.sender,
            description,
            image,
            twitter,
            telegram,
            website
        );

        // Track the deployed token address
        deployedTokens.push(address(newToken));

        // Emit a TokenCreated event
        emit TokenCreated(
            address(newToken),
            name,
            symbol,
            description,
            image,
            twitter,
            telegram,
            website,
            msg.sender
        );
    }

    /**
     * @dev Get the list of all deployed token addresses.
     */
    function getDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
}
