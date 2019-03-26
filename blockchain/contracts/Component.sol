pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";


contract Component is Ownable { 

    /** 
    * TODO:
    * - Add the other component specific fields 
    * - add modifiers for state management
    * - Add a field to allow ONLY the Manager contract to 
    *   change the state of the contract
    * - emit the proper events in order to track the component history
    */
    enum EntityState { 
        // An entity will be in Editable state only at the beginning 
        Editable,
        // When an entity is posted for sale it goes into SubmitedForSale state
        SubmitedForSale,
        // Simply means that an entity is being used by a user who owns it
        Owned,
        // An Entity gets into Broken state if one of the components has been removed without being replaced
        // if a entity gets into broken state must be changed with another one that you are the owner of  
        Broken,
        // When the expiration period is finished then the Entity will get into needs recycled
        // This has to be flagged by another user whoich is gonna get rewarded  
        NeedsRecylced,
        // Recycling an entity should give the user who recilced it some tokens
        // That can be reused in the ecosystem
        Recycled,
        // When a component is being destroyed/removed by an user 
        Destroyed
    }

    string componentName;
    uint256 creationgTime;
    uint64 expiration;
    uint128 price;
    EntityState state;
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
        EntityState state,
        string _otherInformation,
        address _parentComponentAddress
    ); 

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
        state = EntityState.Editable; 
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

    function updateParentAddress(address _parentComponentAddress) external {
        parentComponentAddress = _parentComponentAddress;    
    }    

    // function updateData(string calldata _data) external { 
    //     data = _data; 
    // }

    // child specific operations
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
            EntityState,
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
