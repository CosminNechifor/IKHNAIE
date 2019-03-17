pragma solidity >=0.4 <0.6.0; 

interface IRegistry {
    function addComponent(address _componentAddress) external;
    function removeComponent(uint256 _index) external;
    function getRegistrySize() external view returns(uint256);
    function getRegistredComponentAtIndex(uint256 _index) external view returns(address);
    function getRegistredComponents() external view returns(address[] memory);
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}