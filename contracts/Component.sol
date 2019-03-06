pragma solidity >=0.4 <0.6.0; 


import "./Ownable.sol";


contract Component is Ownable { 

    /** 
    * TODO:
    * - Add the other component specific fields 
    * - add modifiers for state management
    * - emit the proper events in order to track the component history
    */

    string data;

    address parentComponentAddress;
    address[] childComponentList;
    
    constructor(string memory _data, address owner) Ownable(owner) public {
        data = _data;
        parentComponentAddress = address(0); 
    }

    function updateParentAddress(address _parentComponentAddress) external {
        parentComponentAddress = _parentComponentAddress;    
    }    

    function updateData(string calldata _data) external { 
        data = _data; 
    }

    // child specific operations
    function addChild(address _childComponentAddress) external {
        childComponentList.push(_childComponentAddress) - 1;
    }

    function removeChild(uint256 _index) external {
        uint256 lastElementIndex = childComponentList.length - 1;
        address _childComponentAddress = childComponentList[lastElementIndex]; 

        childComponentList[_index] = _childComponentAddress;
        
        // deleteing the element and enusre there is no empty space
        delete childComponentList[lastElementIndex];
        childComponentList.length--;
    }

    function getData() external view returns (string memory){
        return data;
    }

    function getParentComponentAddress() external view returns (address) {
        return parentComponentAddress;
    }

    function getNumberOfChildComponents() external view returns(uint256) {
        return childComponentList.length;
    }

    function getChildComponentAddressById(uint256 _childComponentAddress) external view returns(address) {
        return childComponentList[_childComponentAddress];
    }
}