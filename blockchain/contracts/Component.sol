pragma solidity >=0.4 <0.6.0;

import "./Managed.sol";
import "./IComponent.sol";

contract Component is IComponent, Managed {

    string componentName;
    uint256 creationTime;
    uint64 expiration;
    uint128 price;
    ComponentState state;
    string otherInformation;

    address private _owner;
    address private parentComponentAddress;
    address[] private childComponentList;

    mapping (address => Presence) private _addressToIndex;

    modifier inEditableState() {
        require(state == ComponentState.Editable, "Component is not in Editable state.");
        _;
    }

    modifier inOwnedState() {
        require(state == ComponentState.Owned, "Component is not in Owned state.");
        _;
    }

    modifier notInSubmitedForSaleState() {
        require(state != ComponentState.SubmitedForSale, "Component is in SubmitedForSale state.");
        _;
    }

    modifier inSubmitedForSaleState() {
        require(state == ComponentState.SubmitedForSale, "Component is not in SubmitedForSale state.");
        _;
    }

    modifier inBrokenState() {
        require(state == ComponentState.Broken, "Component is not in Broken state.");
        _;
    }

    modifier inNeedsRecycledState() {
        require(state == ComponentState.NeedsRecycled, "Component is not in NeedsRecycled state.");
        _;
    }

    modifier notInNeedsRecycledState() {
        require(state != ComponentState.NeedsRecycled, "Component is in NeedsRecycled state.");
        _;
    }

    modifier notInRecycledOrDestoyedState() {
        require(state != ComponentState.Recycled, "Component was already recycled.");
        require(state != ComponentState.Destroyed, "Component was already destroyed.");
        _;
    }

    modifier isExpired() {
        require(block.timestamp >= creationTime + expiration, "Component has not expired yet.");
        _;
    }

    modifier isPartOfAnotherComponent() {
        require(_owner == address(0), "The component is not part of another component.");
        _;
    }

    modifier isPresent(address _componentAddress) {
        require(_addressToIndex[_componentAddress]._isPresent, "The component is not part of this component.");
        _;
    }

    constructor(
        address manager,
        address owner,
        string memory _componentName,
        uint64 _expirationTime,
        uint128 _price,
        string memory _otherInformation
    )
        Managed(manager)
        public
    {
        _owner = owner;
        componentName = _componentName;
        creationTime = block.timestamp;
        expiration = _expirationTime;
        price = _price;
        state = ComponentState.Editable;
        otherInformation = _otherInformation;

        parentComponentAddress = address(0);

        emit ComponentCreated(
            owner,
            componentName,
            creationTime,
            expiration,
            price,
            state,
            otherInformation,
            parentComponentAddress
        );
    }

    function updateComponentName(
        string calldata _componentName
    )
        external
        onlyManager
        inEditableState
    {
        emit ComponentNameUpdated(
            componentName,
            _componentName
        );
        componentName = _componentName;
    }

    function updateConnection(
        address _address
    )
        external
        onlyManager
        notInSubmitedForSaleState
        notInNeedsRecycledState
        notInRecycledOrDestoyedState
    {
        // if the component has no parent
        if (parentComponentAddress == address(0)) {
            // TODO: events must be emited
            parentComponentAddress = _address;
            _owner = address(0);
        } else {
            parentComponentAddress = address(0);
            _owner = _address;
        }
    }

    function updateComponentExpiration(
        uint64 _expiration
    )
        external
        onlyManager
        inEditableState
    {
        emit ComponentExpirationUpdated(
            expiration,
            _expiration
        );
        expiration = _expiration;
    }

    function updateComponentPrice(
        uint128 _price
    )
        external
        onlyManager
        notInNeedsRecycledState
        notInRecycledOrDestoyedState
    {
        emit ComponentPriceUpdated(
            price,
            _price
        );
        price = _price;
    }

    function updateComponentOtherInformation(
        string calldata _otherInformation
    )
        external
        onlyManager
        inEditableState
    {
        emit ComponentOtherInformationUpdated(
            otherInformation,
            _otherInformation
        );
        otherInformation = _otherInformation;
    }

    function addChild(
        address _childComponentAddress
    )
        external
        notInNeedsRecycledState
        notInSubmitedForSaleState
        notInRecycledOrDestoyedState
    {
        uint64 _childIndex = uint64(childComponentList.push(_childComponentAddress) - 1);
        Presence memory _presence = Presence({
            _isPresent: true,
            _index: _childIndex
        });
        _addressToIndex[_childComponentAddress] = _presence;
        emit ComponentChildAdded(
            _childComponentAddress,
            childComponentList
        );
    }

    function removeChild(
        address _childComponentAddress
    )
        external
        onlyManager
        notInSubmitedForSaleState
        notInNeedsRecycledState
        notInRecycledOrDestoyedState
        isPresent(_childComponentAddress)
        returns
        (
            address
        )
    {
        uint64 lastElementIndex = uint64(childComponentList.length - 1);
        address _lastChildComponentAddress = childComponentList[lastElementIndex];

        uint64 _index = _addressToIndex[_childComponentAddress]._index;
        delete _addressToIndex[_childComponentAddress];
        childComponentList[_index] = _lastChildComponentAddress;

        Presence memory p = Presence({
            _isPresent: true,
            _index: _index
        });

        _addressToIndex[_lastChildComponentAddress] = p;

        // delete the element and ensure there is no empty space
        delete childComponentList[lastElementIndex];
        childComponentList.length--;

        emit ComponentChildRemoved(
            _childComponentAddress,
            childComponentList
        );
        return _childComponentAddress;
    }

    function submitForSale()
        external
        onlyManager
        notInSubmitedForSaleState
        notInRecycledOrDestoyedState
        returns (bool)
    {
        state = ComponentState.SubmitedForSale;
        emit ComponentSubmitedForSale(
            block.timestamp,
            price
        );
        return true;
    }

    function removeFromSale()
        external
        onlyManager
        inSubmitedForSaleState
        returns (bool)
    {
        state = ComponentState.Owned;
        emit ComponentWasRemovedFromSale(
            block.timestamp,
            price
        );
        return true;
    }

    function flagAsExpired()
        external
        onlyManager
        notInNeedsRecycledState
        notInRecycledOrDestoyedState
        isExpired
    {
       state = ComponentState.NeedsRecycled;
       emit ComponentIsExpired();
    }

    function flagAsBroken()
        external
        onlyManager
        notInNeedsRecycledState
        notInRecycledOrDestoyedState
    {
       state = ComponentState.Broken;
       emit ComponentIsBroken();
    }

    function transferOwnership(address _newOwner)
        external
        onlyManager
        inSubmitedForSaleState
        returns (bool)
    {
       state = ComponentState.Owned;
       _owner = _newOwner;
       emit ComponentOwnershipTransfered(_owner, _newOwner);
       return true;
    }

    function repair(address _repairer)
        external
        onlyManager
        inBrokenState
    {
        state = ComponentState.Owned;
        emit ComponentRepaired(_repairer);
    }

    function recycle(address _recycler)
        external
        onlyManager
        inNeedsRecycledState
    {
        state = ComponentState.Recycled;
        emit ComponentRecycled(_recycler);
    }

    function destroy(address _destroyer)
        external
        onlyManager
        inNeedsRecycledState
    {
        state = ComponentState.Destroyed;
        emit ComponentDestroyed(_destroyer);
    }

    function getData()
        external
        view
        returns
        (
            address,
            string memory,
            uint256,
            uint64,
            uint128,
            uint8,
            string memory,
            address,
            address[] memory
        )
    {
        return (
            _owner,
            componentName,
            creationTime,
            expiration,
            price,
            uint8(state),
            otherInformation,
            parentComponentAddress,
            childComponentList
        );
    }

    function getParentComponentAddress()
        external
        view
        returns
        (
            address
        )
    {
        return parentComponentAddress;
    }

    function getNumberOfChildComponents()
        external
        view
        returns
        (
            uint256
        )
    {
        return childComponentList.length;
    }

    function getChildComponentList()
        external
        view
        returns
        (
            address[] memory
        )
    {
        return childComponentList;
    }

    function getChildComponentAddressByIndex(
        uint256 _index
    )
        external
        view
        returns
        (
            address
        )
    {
        return childComponentList[_index];
    }

    function getOwner()
        external
        view
        returns
        (
            address
        )
    {
        return _owner;
    }

    // use carefully
    function getChildComponentIndexByAddress(
        address _address
    )
        external
        view
        returns
        (
            uint256
        )
    {
        uint256 length = childComponentList.length;
        for (uint256 i = 0; i < length; i++) {
            if(_address == childComponentList[i]) {
                return i;
            }
        }
    }
}
