pragma solidity >=0.4 <0.6.0; 

import "./Management.sol";

contract Component is Management { 

    enum ComponentState { 
        // An component will be in Editable state only at the beginning 
        Editable,
        // When a component is posted for sale it goes into SubmitedForSale state
        SubmitedForSale,
        // Simply means that a component is being used by a user who owns it
        Owned,
        // A Component gets into Broken state if one of the components has been removed without being replaced
        // if a component gets into broken state must be changed with another one that you are the owner of  
        Broken,
        // When the expiration period is finished then the Component will get into needs recycled
        // This has to be flagged by another user whoich is gonna get rewarded  
        NeedsRecycled,
        // Recycling an component should give the user who recilced it some tokens
        // That can be reused in the ecosystem
        Recycled,
        // When a component is being destroyed
        Destroyed
    }

    string componentName;
    uint256 creationTime;
    uint64 expiration;
    uint128 price;
    ComponentState state;
    string otherInformation;

    // navigation fields
    address private _owner;
    // index to know exacty at which position the in the parrent array
    // this component is
    address private parentComponentAddress;
    address[] private childComponentList;

    struct Presence {
        bool _isPresent;
        uint64 _index;
    }

    mapping (address => Presence) private _addressToIndex;
    
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

    modifier inEditableState() {
        require(state == ComponentState.Editable, "Component is not in Editable state.");
        _;
    }

    modifier notInSubmitedForSaleState() {
        require(state != ComponentState.SubmitedForSale, "Component is in SubmitedForSale state.");
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
        // TODO: make it > 
        require(block.timestamp >= creationTime + expiration, "Component has not expired yet.");
        _;
    }

    modifier isPartOfAnotherComponent() {
        require(_owner == address(0), "The component is not part of another component.");
        _;
    }

    modifier isPresent(address _componentAddress) {
        require(_addressToIndex[_componentAddress]._isPresent , "The component is not part of this component.");
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
        Management(manager)
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
    
    // Todo: manager has to check if the sender is the component owner
    // only the manager can change the components -> modifer exists and needs to
    // be added to the functions
    function updateComponentName(
        string calldata _componentName
    )
        external
        onlyManager()
        inEditableState()
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
        onlyManager()
        notInSubmitedForSaleState()
        notInNeedsRecycledState()
        notInRecycledOrDestoyedState()
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
    
    // we don't need the component to be in any state
    // to update the price
    function updateComponentExpiration(
        uint64 _expiration
    )
        external
        onlyManager()
        inEditableState()
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
        onlyManager()
        notInNeedsRecycledState()
        notInRecycledOrDestoyedState()
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
        onlyManager()
        inEditableState()
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
        notInNeedsRecycledState()
        notInSubmitedForSaleState()
        notInRecycledOrDestoyedState()
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
        onlyManager()
        notInSubmitedForSaleState()
        notInNeedsRecycledState()
        notInRecycledOrDestoyedState()
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

    function flagAsExpired() 
        external 
        onlyManager()
        notInNeedsRecycledState()
        notInRecycledOrDestoyedState()
        isExpired()  
    {
       state = ComponentState.NeedsRecycled; 
       emit ComponentIsExpired();
    }

    function flagAsBroken() 
        external 
        onlyManager()
        notInNeedsRecycledState()
        notInRecycledOrDestoyedState()
    {
       state = ComponentState.Broken; 
       emit ComponentIsBroken();
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

    // has to be replaced
    // it was added only termporary
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
