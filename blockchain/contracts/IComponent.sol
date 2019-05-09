pragma solidity >=0.4 <0.6.0;

interface IComponent{

    enum ComponentState {
        // An component will be in Editable state only at the beginning
        Editable, // 0
        // When a component is posted for sale it goes into SubmitedForSale state
        SubmitedForSale, // 1
        // Simply means that a component is being used by a user who owns it
        Owned, // 2
        // A Component gets into Broken state if one of the components has been removed without being replaced
        // if a component gets into broken state must be changed with another one that you are the owner of
        Broken, // 3
        // When the expiration period is finished then the Component will get into needs recycled
        // This has to be flagged by another user whoich is gonna get rewarded
        NeedsRecycled, // 4
        // Recycling an component should give the user who recilced it some tokens
        // That can be reused in the ecosystem
        Recycled, // 5
        // When a component is being destroyed
        Destroyed // 6
    }

    struct Presence {
        bool _isPresent;
        uint64 _index;
    }

    event ComponentCreated
    (
        address _owner,
        string _componentName,
        uint256 _creationTime,
        uint64 _expiration,
        uint128 _price,
        ComponentState state,
        string _otherInformation,
        address _parentComponentAddress
    );

    event ComponentSubmitedForSale(
        uint256 timestamp,
        uint128 price
    );

    event ComponentWasRemovedFromSale(
        uint256 timestamp,
        uint128 price
    );

    event ComponentNameUpdated(
        string _oldName,
        string _newName
    );

    event ComponentParentAddressUpdated(
        address _previousParent,
        address _newParent
    );

    event ComponentExpirationUpdated(
        uint64 _oldExpiration,
        uint64 _newExpiration
    );

    event ComponentPriceUpdated(
        uint128 _oldPrice,
        uint128 _newPrice
    );

    event ComponentOtherInformationUpdated(
        string _oldOtherInformation,
        string _newOtherInformation
    );

    event ComponentChildAdded(
        address _newChildComponent,
        address[] _newChildComponentList
    );

    event ComponentChildRemoved(
        address _removedComponent,
        address[] _newChildComponentList
    );

    event ComponentIsBroken();

    event ComponentIsExpired();

    event ComponentRepaired(address _repairer);

    event ComponentRecycled(address _recycler);

    event ComponentDestroyed(address _destroyer);

    event ComponentOwnershipTransfered(address _oldOwner, address _newOwner);

    function updateComponentName(string calldata _componentName) external;
    function updateConnection(address _address) external;
    function updateComponentExpiration(uint64 _expiration) external;
    function updateComponentPrice(uint128 _price) external;
    function updateComponentOtherInformation(string calldata _otherInformation) external;
    function addChild(address _childComponentAddress) external;
    function removeChild(address _childComponentAddress) external returns(address);
    function submitForSale() external returns (bool);
    function removeFromSale() external returns (bool);
    function flagAsExpired() external;
    function flagAsBroken() external;
    function repair(address _repairer) external;
    function destroy(address _destroyer) external;
    function recycle(address _recycler) external;
    function transferOwnership(address _newOwner) external returns(bool);
    function getData() external view returns (
        address,
        string memory,
        uint256,
        uint64,
        uint128,
        uint8,
        string memory,
        address,
        address[] memory
    );
    function getParentComponentAddress() external view returns (address);
    function getNumberOfChildComponents() external view returns (uint256);
    function getChildComponentList() external view returns (address[] memory);
    function getChildComponentAddressByIndex(uint256 _index) external view returns (address);
    function getChildComponentIndexByAddress(address _address) external view returns (uint256);
    function getOwner() external view returns(address);
}
