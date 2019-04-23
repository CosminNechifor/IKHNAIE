pragma solidity >=0.4 <0.6.0; 

import "./Managed.sol";

// TODO: limit the number of offers to 256
contract MarketPlace is Managed { 

    struct IndexStorage {
        uint256 indexInComponents;
        uint256 indexInOwnerComponents;
        bool isSubmited;
    }

    struct Offer {
        uint256 amountOfTokens;
        address senderAddress;
    }

    modifier inLimits(address _componentAddress) {
        require(_componentToOffers[_componentAddress].length < 256, "Exceded offers size");
        _;
    }

    modifier isNotSubmited(address _componentAddress) {
        require( ! _addressToIndex[_componentAddress].isSubmited, "Component was already submited");
        _;
    }

    modifier validOfferIndex(address _componentAddress, uint256 _index) {
        require(_componentToOffers[_componentAddress].length > _index, "Not a valid Offer index!");
        _;
    }

    modifier amountBiggerThen(uint256 _amount, uint256 _threshold) {
        require(_amount >= _threshold, "Amount is smaller then the threshold");
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

    constructor(address _manager) Managed(_manager) public {}

    address[] private _components;
    mapping(address => IndexStorage) private _addressToIndex;
    mapping(address => address[]) private _ownerToComponents;

    mapping(address => Offer[]) _componentToOffers;

    function submitForSale(address _owner, address _componentAddress) 
        external
        onlyManager()
        isNotSubmited(_componentAddress)
        returns (bool)
    {
        uint256 _indexInComponents = _components.push(_componentAddress) - 1;
        uint256 _indexInOwnerComponents = _ownerToComponents[_owner].push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = IndexStorage({
            indexInOwnerComponents: _indexInOwnerComponents,
            indexInComponents: _indexInComponents,
            isSubmited: true
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

    // TODO: sender != owner in manager
    function addOffer(
        address _sender,
        address _componentAddress,
        uint256 _amount
    ) 
        external 
        onlyManager() 
        inLimits(_componentAddress)
        amountBiggerThen(_amount, 0) // can be changed to bigger then price
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
        validOfferIndex(_componentAddress, _offerIndex)
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

    // only the owner can calll this function
    function rejectOffer(
        address _componentAddress,
        uint256 _offerIndex
    ) 
        external 
        onlyManager()
        validOfferIndex(_componentAddress, _offerIndex)
        returns (bool)
    {
        uint256 _indexOfLastOffer = _componentToOffers[_componentAddress].length - 1;
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
        uint256 _lastIndexInComponents = _components.length - 1;
        uint256 _indexInOwnerComponents = _addressToIndex[_componentAddress].indexInOwnerComponents;
        uint256 _lastIndexInOwnerComponents = _ownerToComponents[_owner].length - 1;

        address _lastComponentAddress = _components[_lastIndexInComponents];

        _components[_indexInComponents] = _components[_lastIndexInComponents];
        delete _components[_lastIndexInComponents];
        _components.length--;

        _ownerToComponents[_owner][_indexInOwnerComponents] = _ownerToComponents[_owner][_lastIndexInOwnerComponents];
        delete _ownerToComponents[_owner][_lastIndexInOwnerComponents];
        _ownerToComponents[_owner].length--;

        delete _addressToIndex[_componentAddress];
        if (_lastComponentAddress != _componentAddress) {
            _addressToIndex[_lastComponentAddress] = IndexStorage({
                indexInOwnerComponents: _indexInOwnerComponents,
                indexInComponents: _indexInComponents,
                isSubmited: true
            });
        }

        if (_componentToOffers[_componentAddress].length > 0) {
            delete _componentToOffers[_componentAddress];
        }
        return true;
    }

    function getComponentsSubmitedForSale() external view returns (address[] memory) {
       return _components; 
    }

    function getOwnerComonentsSubmitedForSale(
        address _owner
    ) 
        external 
        view 
        returns(address[] memory) 
    {
        return _ownerToComponents[_owner];
    }

    function getComponentOfferByIndex(
        address _componentAddress,
        uint256 _index
    ) 
        external 
        view 
        validOfferIndex(_componentAddress, _index)
        returns (uint256, address) 
    {
        return (
            _componentToOffers[_componentAddress][_index].amountOfTokens,
            _componentToOffers[_componentAddress][_index].senderAddress
        );
    }

    function getComponentOfferSize(
        address _componentAddress
    ) 
        external
        view
        returns(uint256) 
    {
        return _componentToOffers[_componentAddress].length;
    }

    function getIndexByAddress(address _contractAddress) external view returns (uint256, uint256, bool) {
        return (
            _addressToIndex[_contractAddress].indexInComponents,
            _addressToIndex[_contractAddress].indexInOwnerComponents,
            _addressToIndex[_contractAddress].isSubmited
        );
    }

}
