pragma solidity >=0.4 <0.6.0;

interface IRegistry {
    function addComponent(address _componentAddress, uint256 _glassQ, uint256 _metalQ, uint256 _plasticQ) external;
    function removeComponent(uint256 _index) external;
    function getRegistrySize() external view returns(uint256);
    function getRegistredComponentAtIndex(uint256 _index) external view returns(address);
    function getRegistredComponents() external view returns(address[] memory);
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}