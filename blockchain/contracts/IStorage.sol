pragma solidity >=0.4.22 <0.6.0;

interface IStorage {
    function mapComponentToOwner(address _component, address _owner) external;
    function getComponentOwner(address _component) external view returns (address);
    function getOwnerRootComponents(address _owner) external view returns (address[] memory);
    function addChildToParentComponent(address _childComponent, address _parentComponent) external; 
    function removeChildFromParentComponent(address _childComponent, address _parentComponent) external; 
    function getChildComponentListOfAddress(address _component) external view returns (address[] memory);
}
