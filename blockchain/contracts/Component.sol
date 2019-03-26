pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";


contract Component is Ownable { 

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
        NeedsRecylced,
        // Recycling an component should give the user who recilced it some tokens
        // That can be reused in the ecosystem
        Recycled,
        // When a component is being destroyed/removed by an user 
        Destroyed
    }

    string componentName;
    uint256 creationgTime;
    uint64 expiration;
    uint128 price;
    ComponentState state;
    string otherInformation;

    // navigation fields
    address private parentComponentAddress;
    address[] private childComponentList;

    
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

    modifier inEditableState() {
        require(state == ComponentState.Editable, "Component is not in Editable state.");
        _;
    }

    modifier inSubmitedForSaleState() {
        require(state == ComponentState.SubmitedForSale, "Component is not in SubmitedForSale state.");
        _; 
    }

    modifier inOwnedState() {
        require(state == ComponentState.Owned, "Component is not in Owned state.");
        _; 
    }

    modifier inBrokenState() {
        require(state == ComponentState.Broken, "Component is not in Broken state.");
        _;
    }

    modifier inNeedsRecycledState() {
        require(state == ComponentState.NeedsRecylced, "Component is not in NeedsRecycled state.");
        _;
    }

    // TODO: add it to the other update functions
    modifier onlyManager(address managerAddress) {
        require(msg.sender == managerAddress, "Not called from manager contract!");
        _;
    }

    constructor(
        address owner,
        string memory _componentName,
        uint64 _expirationTime,
        uint128 _price,
        string memory _otherInformation
    ) 
        Ownable(owner)
        public
    {
        componentName = _componentName;
        creationgTime = block.timestamp;
        expiration = _expirationTime;
        price = _price;
        state = ComponentState.Editable; 
        otherInformation = _otherInformation;

        parentComponentAddress = address(0); 

        emit ComponentCreated(
            owner,
            componentName,
            creationgTime,
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
        inEditableState()
    {
        componentName = _componentName; 
    }

    function updateParentAddress(
        address _parentComponentAddress
    ) 
        external
        inEditableState()
    {
        parentComponentAddress = _parentComponentAddress;    
    }    
    
    // we don't need the component to be in any state
    // to update the price
    function updateComponentExpiration(
        uint64 _expiration
    )
        external
    {
        expiration = _expiration;
    }

    function updateComponentPrice(
        uint128 _price
    )
        external
        inEditableState()
    {
        price = _price;
    }

    function addChild(address _childComponentAddress) external {
        childComponentList.push(_childComponentAddress);
    }

    function removeChild(uint256 _index) external {
        uint256 lastElementIndex = childComponentList.length - 1;
        address _childComponentAddress = childComponentList[lastElementIndex]; 

        childComponentList[_index] = _childComponentAddress;
        
        // deleteing the element and enusre there is no empty space
        delete childComponentList[lastElementIndex];
        childComponentList.length--;
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
            ComponentState,
            string memory,
            address,
            address[] memory
        )
    {
        return (
            owner(),
            componentName,
            creationgTime,
            expiration,
            price,
            state,
            otherInformation,
            parentComponentAddress,
            childComponentList
        );
    }

    function getParentComponentAddress() external view returns (address) {
        return parentComponentAddress;
    }

    function getNumberOfChildComponents() external view returns(uint256) {
        return childComponentList.length;
    }

    function getChildComponentList() external view returns(address[] memory) {
        return childComponentList;
    }

    function getChildComponentAddressByIndex(uint256 _index) external view returns(address) {
        return childComponentList[_index];
    }

    // use carefully
    function getChildComponentIndexByAddress(address _address) external view returns(uint256) {
        uint256 length = childComponentList.length;
        for (uint256 i = 0; i < length; i++) {
            if(_address == childComponentList[i]) {
                return i;
            }
        } 
    }
}
