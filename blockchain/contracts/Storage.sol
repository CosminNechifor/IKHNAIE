pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./Management.sol";

contract Storage is Ownable, Management {

    // This would be helpful in the determination of the parent component of a component
    mapping(address => address) componentToParent;

    // Helpful when finding what components does this owner own. 
    mapping (address => address[]) private ownerToRootComponents;
    
    // Having the address of a root component we can easily discover which is the owner
    // and we dont have to go over all the values of the mapping above. 
    mapping (address => address) private rootComponentToOwner; 

    constructor(address _manager) Management(_manager) Ownable(msg.sender) public {}

    function mapComponentToOwner(address _component, address _owner) onlyManager() external {
        rootComponentToOwner[_component] = _owner;
        ownerToRootComponents[_owner].push(_component);
        componentToParent[_component] = address(0); 
    }

    function getComponentOwner(address _component) external view returns (address) {
        // if the address is equal to 0x00000
        if (componentToParent[_component] == address(0)) {
            // then it's a root component 
            // and we use the other mapping to get the owner
            return rootComponentToOwner[_component];
        } 
        // else we find the root and retunr the owner address
        address root = getRootComponentAddress(_component);
        return rootComponentToOwner[root];
    }

    function getRootComponentAddress(address _component) internal view returns (address) {
        address root = componentToParent[_component]; 
        while(componentToParent[root] != address(0)) {
            root = componentToParent[root];
        }
        return root;
    }

    // also known as get owner all components
    function getOwnerRootComponents(address _owner) external view returns (address[] memory) {
        return ownerToRootComponents[_owner];
    }
}
