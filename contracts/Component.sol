pragma solidity >=0.4 <0.6.0; 


contract Component { 
    address parentComponentAddress;
    string data;

    uint256 childComponentNumber;
    address owner;

    event ChildComponentAdded(uint256 index, address componentAddress);
    event ChildComponentRemoved(uint256 index, address componentAddress);

    event UpdateParentAddress(address componentAddress);
    event DataWasUpdated(string _previousData, string _newData);

    mapping (uint256 => address) indexToComponentAddress;
    mapping (address => uint256) childComponentAddressToIndex;

    constructor(string memory _data, address _owner) public {
        data = _data;
        owner = _owner;
        childComponentNumber = 0;
        parentComponentAddress = address(0); 
    }

    function updateParentAddress(address _parentComponentAddress) external {
        parentComponentAddress = _parentComponentAddress;    
        emit UpdateParentAddress(_parentComponentAddress);
    }    

    function updateData(string calldata _data) external { 
        emit DataWasUpdated(data, _data);
        data = _data; 
    }

    function addChild(address _childComponentAddress) external {
        indexToComponentAddress[childComponentNumber] = _childComponentAddress;
        childComponentAddressToIndex[_childComponentAddress] = childComponentNumber;
        childComponentNumber++; 
        emit ChildComponentAdded(childComponentNumber, _childComponentAddress);
    }

    function removeChild(address _childComponentAddress) external {
        uint256 childComponentIndex = childComponentAddressToIndex[_childComponentAddress]; 
        delete indexToComponentAddress[childComponentIndex];
        emit ChildComponentRemoved(childComponentIndex, _childComponentAddress);
    }

    function getData() external view returns (string memory){
        return data;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getChildComponentNumber() external view returns(uint256) {
        return childComponentNumber;
    }

    function getChildComponentIndexByAddress(address _childComponentAddress) external view returns(uint256) {
        return childComponentAddressToIndex[_childComponentAddress];
    }

    function getChildComponentAddressById(uint256 _childComponentAddress) external view returns(address) {
        return indexToComponentAddress[_childComponentAddress];
    }
}