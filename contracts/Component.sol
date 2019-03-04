pragma solidity >=0.4 <0.6.0; 


contract Component { 
    address parentComponentAddress;
    string data;

    uint256 componentNumber;
    address owner;

    event ChildComponentAdded(uint256 index, address componentAddress);
    event ChildComponentRemoved(uint256 index, address componentAddress);

    event UpdateParentAddress(address componentAddress);
    event DataWasUpdated(string _previousData, string _newData);

    mapping (uint256 => address) indexToComponentAddress;
    mapping (address => uint256) componentAddressToIndex;

    constructor(string memory _data, address _owner) public {
        data = _data;
        owner = _owner;
        componentNumber = 0;
        parentComponentAddress = address(0); 
    }

    function addChild(address _childComponentAddress) external {
        indexToComponentAddress[componentNumber] = _childComponentAddress;
        componentAddressToIndex[_childComponentAddress] = componentNumber;
        componentNumber++; 
        emit ChildComponentAdded(componentNumber, _childComponentAddress);
    }

    function removeChild(address _childComponentAddress) external {
        uint256 componentNumber = componentAddressToIndex[_childComponentAddress]; 
        delete indexToComponentAddress[componentNumber];
        emit ChildComponentRemoved(componentNumber, _childComponentAddress);
    }

    function updateParentAddress(address _parentComponentAddress) external {
        parentComponentAddress = _parentComponentAddress;    
        emit UpdateParentAddress(_parentComponentAddress);
    }

    function updateData(string calldata _data) external { 
        emit DataWasUpdated(data, _data);
        data = _data; 
    }

    function getChildComponentIndexByAddress(address _childComponentAddress) external view returns(uint256) {
        return componentAddressToIndex[_childComponentAddress];
    }

    function getChildComponentAddressById(uint256 _childComponentAddress) external view returns(address) {
        return indexToComponentAddress[_childComponentAddress];
    }

    function getData() external view returns (string memory){
        return data;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getComponentNumber() external view returns(uint256) {
        return componentNumber;
    }
}