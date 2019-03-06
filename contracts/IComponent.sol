pragma solidity >=0.4 <0.6.0; 

interface IComponent{
    function updateParentAddress(address _parentComponentAddress) external;
    function updateData(string calldata _data) external; 
    function addChild(address _childComponentAddress) external; 
    function removeChild(uint256 _index) external;
    function getData() external view returns (string memory);
    function getParentComponentAddress() external view returns (address);
    function getNumberOfChildComponents() external view returns(uint256);
    function getChildComponentList() external view returns(address[] memory);
    function getChildComponentAddressByIndex(uint256 _index) external view returns(address);
    function getChildComponentIndexByAddress(address _address) external view returns(uint256);
    function owner() external view returns (address); 
    function transferOwnership(address newOwner) external; 
}