pragma solidity >=0.4 <0.6.0; 


contract Component { 
    address parentComponentAddress;
    string data;

    uint256 componentNumber;
    address owner;

    // event ComponentAdded(uint256 index, address componentAddress);
    // event ComponentRemoved(uint256 index, address componentAddress);
    // event ComponentUpdated(uint256 index, address componentAddress);

    mapping (uint256 => address) indexToComponentAddress;
    mapping (address => uint256) componentAddressToIndex;

    constructor(string memory _data, address _owner) public {
        data = _data;
        owner = _owner;
        componentNumber = 1;
        // Components with address 0x000 are not part of another component
        parentComponentAddress = address(0); 
    }

    function addChild(address _childComponentAddress) external {
        indexToComponentAddress[componentNumber] = _childComponentAddress;
        // emit ComponentAdded(componentNumber, _childComponentAddress);
    }

    function removeChild(address _childComponentAddress) external returns(address) {
        uint256 componentNumber = componentAddressToIndex[_childComponentAddress]; 
        delete indexToComponentAddress[componentNumber];
    }

    function updateParentAddress(address _parrentComponentAddress) external {
        parentComponentAddress = _parrentComponentAddress;    
    }

    function updateData(string calldata _data) external { 
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
}