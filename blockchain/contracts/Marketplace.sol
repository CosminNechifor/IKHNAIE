pragma solidity >=0.4 <0.6.0; 

import "./Management.sol";

// TODO: limit the number of offers to 256
contract MarketPlace is Management { 

    struct IndexStorage {
        uint256 indexInComponents;
        uint256 indexInOwnerComponents;
    }

    struct Offer {
        uint256 amountOfTokens;
        address senderAddress;
    }

    modifier inLimits(address _componentAddress) {
        require(_componentToOffers[_componentAddress].length < 256, "Exceded offers size");
        _;
    }

    event ComponentWasSubmitedForSale(address _componentAddress);

    event ComponentWasRemovedFromSale(address _componentAddress);

    event NewOffer(
        address _sender,
        address _componentAddress,
        uint256 _amountOfTokens
    );

    event OfferAccepted(
        address _sender,
        address _componentAddress,
        uint256 _amountOfTokens
    );

    event OfferRejected(
        address _sender,
        address _componentAddress,
        uint256 _amountOfTokens
    );

    constructor(address _manager) Management(_manager) public {}

    address[] private _components;
    mapping(address => IndexStorage) private _addressToIndex;
    mapping(address => address[]) private _ownerToComponents;

    mapping(address => Offer[]) _componentToOffers;

    function submitForSale(address _owner, address _componentAddress) 
        external
        onlyManager()
        returns (bool)
    {
        uint256 _indexInComponents = _components.push(_componentAddress) - 1;
        uint256 _indexInOwnerComponents = _ownerToComponents[_owner].push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = IndexStorage({
            indexInOwnerComponents: _indexInOwnerComponents,
            indexInComponents: _indexInComponents
        });
        emit ComponentWasSubmitedForSale(_componentAddress);
        return true;
    }

    function removeFromSale(
        address _owner,
        address _componentAddress
    ) 
        external 
        onlyManager() 
        returns (bool)
    {
        require(_performStorageCleanup(_owner, _componentAddress), "Storage cleanup failed!");
        emit ComponentWasRemovedFromSale(_componentAddress);
        return true;
    }


    function addOffer(
        address _sender,
        address _componentAddress,
        uint256 _amount
    ) 
        external 
        onlyManager() 
        inLimits(_componentAddress)
    {
        _componentToOffers[_componentAddress].push(Offer({
            amountOfTokens: _amount,
            senderAddress: _sender
        }));
        emit NewOffer(_sender, _componentAddress, _amount);
    }

    function acceptOffer(
        address _owner,
        address _componentAddress,
        uint256 _offerIndex
    ) 
        external 
        onlyManager()
        returns (address, uint256)
    {
        Offer memory offer = _componentToOffers[_componentAddress][_offerIndex]; 
        require(_performStorageCleanup(_owner, _componentAddress), "Storage cleanup failed!");
        emit OfferAccepted(
            offer.senderAddress,
            _componentAddress,
            offer.amountOfTokens
        );
        return (offer.senderAddress, offer.amountOfTokens);
    }

    function rejectOffer(
        address _componentAddress,
        uint256 _offerIndex
    ) 
        external 
        onlyManager()
        returns (bool)
    {
        uint256 _indexOfLastOffer = _componentToOffers[_componentAddress].length;
        Offer memory offer = _componentToOffers[_componentAddress][_offerIndex];
        _componentToOffers[_componentAddress][_offerIndex] = _componentToOffers[_componentAddress][_indexOfLastOffer]; 
        delete _componentToOffers[_componentAddress][_indexOfLastOffer];
        _componentToOffers[_componentAddress].length--;
        emit OfferRejected(
            offer.senderAddress,
            _componentAddress,
            offer.amountOfTokens
        );
        return true;
    }

    function _performStorageCleanup(
        address _owner,
        address _componentAddress
    ) 
        private 
        returns(bool)
    {
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
        return true;
    }

    function getComponentsSubmitedForSale() external view returns (address[] memory) {
       return _components; 
    }

    function getOwnerComonentsSubmitedForSale(address _owner) external view returns(address[] memory){
        return _ownerToComponents[_owner];
    }

    function getComponentOffers(address _componentAddress) external view returns () {

    }
}
