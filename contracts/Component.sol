pragma solidity >=0.4 <0.6.0; 
pragma experimental ABIEncoderV2;


contract Component { 
    address private parrentComponentAddress;
    string data;
    uint256 componentNumber;

    event ComponentAdded(uint256 index, address);
    event ComponentRemoved(uint256 index, address);
    event ComponentUpdated(uint256 index, address);

    mapping (uint256 => address) indexToComponentAddress;
    mapping (address => uint256) componentAddressToIndex;

    constructor(string memory _data) public {
        data = _data;
        componentNumber = 1;
    }

    function addChild(address _childComponentAddress) public {
        indexToComponentAddress[componentNumber] = _childComponentAddress;
        emit ComponentAdded(componentNumber, _childComponentAddress);
    }

    //must be called by some other contract 
    function removeChild(address _childComponentAddress) external returns(address) {
        uint256 componentNumber = componentAddressToIndex[_childComponentAddress]; 
        delete indexToComponentAddress[componentNumber];
    }

    function updateParentAddress(address _parrentComponentAddress) public {
        parrentComponentAddress = _parrentComponentAddress;    
    }

    function updateData(string memory _data) public { 
        data = _data; 
    }

    function getData() public returns (string memory){
        return data;
    }
}