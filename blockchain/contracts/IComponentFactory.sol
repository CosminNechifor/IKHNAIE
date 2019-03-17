pragma solidity >=0.4.22 <0.6.0;

interface IComponentFactory {
    function createComponent(string calldata _componentData, address _owner) external returns (address);
}