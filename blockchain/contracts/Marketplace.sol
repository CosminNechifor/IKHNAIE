pragma solidity >=0.4 <0.6.0; 

import "./Management.sol";

contract MarketPlace is Management { 

    struct IndexStorage {
        uint256 indexInComponents;
        uint256 indexInOwnerComponents;
    }

    struct Offer {
        uint256 _amountOfTokens;
        address _senderAddress;
    }

    event ComponentWasSubmitedForSale(address _componentAddress);
    event ComponentWasRemovedFromSale(address _componentAddress);

    constructor(address _manager) Management(_manager) public {}

    address[] private _components;
    mapping(address => IndexStorage) private _addressToIndex;
    mapping(address => address[]) private _ownerToComponents;

    mapping(address => Offer[]) _componentToOffers;

    function submitForSale(address _owner, address _componentAddress) 
        external
        onlyManager()
    {
        uint256 _indexInComponents = _components.push(_componentAddress) - 1;
        uint256 _indexInOwnerComponents = _ownerToComponents[_owner].push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = IndexStorage({
            indexInOwnerComponents: _indexInOwnerComponents,
            indexInComponents: _indexInComponents
        });
        emit ComponentWasSubmitedForSale(_componentAddress);
    }

    function removeFromSale(address _owner, address _componentAddress) external onlyManager() {
        uint256 _indexInComponents = _addressToIndex[_componentAddress].indexInComponents;
        uint256 _indexInOwnerComponents = _addressToIndex[_componentAddress].indexInOwnerComponents;
        uint256 _lastIndexInComponents = _components.length - 1;
        uint256 _lastIndexInOwnerComponents = _ownerToComponents[_owner].length - 1;

        _components[_indexInComponents] = _components[_lastIndexInComponents];
        delete _components[_lastIndexInComponents];
        _components.length--;

        _ownerToComponents[_owner][_indexInOwnerComponents] = _ownerToComponents[_owner][_lastIndexInOwnerComponents];
        delete _ownerToComponents[_owner][_lastIndexInOwnerComponents];
        _ownerToComponents[_owner].length--;

        if (_componentToOffers[_componentAddress].length > 0) {
            delete _componentToOffers[_componentAddress];
        }

        emit ComponentWasRemovedFromSale(_componentAddress);
    }

    function acceptOffer() public {

    }

    function rejectOffer() public {

    }
}
