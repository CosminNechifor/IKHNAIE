pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./Management.sol";

contract Storage is Ownable, Management {

    struct Info {
        address owner; // address of the owner
        uint256 index; // index inside the RootComponentList
    }

    modifier isRootComponent(address _componentAddress) {
        require(componentToParent[_componentAddress] == address(0));
        _;
    }

    modifier notRootComponent(address _componentAddress) {
        require(componentToParent[_componentAddress] != address(0));
        _;
    }

    // This would be helpful in the determination of the parent component of a component
    mapping(address => address) private componentToParent;

    // Helpful when finding what components does this owner own. 
    mapping (address => address[]) private ownerToRootComponents;
    
    // Having the address of a root component we can easily discover which is the owner
    // and we dont have to go over all the values of the mapping above. 
    mapping (address => Info) private rootComponentToInfo; 

    constructor(address _manager) Management(_manager) Ownable(msg.sender) public {}

    function mapComponentToOwner(address _component, address _owner) onlyManager() external {
        uint256 _index = ownerToRootComponents[_owner].push(_component) - 1;
        componentToParent[_component] = address(0); // makes it a root component
        Info memory info = Info({
            owner: _owner,
            index: _index
        });
        rootComponentToInfo[_component] = info;
    }

    // notInNeedsRecycledState()
    // notInSubmitedForSaleState()
    // notInRecycledOrDestoyedState()
    function addChildToParentComponent(
        address _childComponent,
        address _parentComponent
    ) 
        external 
        onlyManager()
        isRootComponent(_childComponent)
    {
        componentToParent[_childComponent] = _parentComponent;
        
        // extract information
        Info storage info = rootComponentToInfo[_childComponent];

        // perform reconstruction of the data structures
        uint256 lastIndex = ownerToRootComponents[info.owner].length - 1;
        // put the last element where the old root component was
        ownerToRootComponents[info.owner][info.index] = ownerToRootComponents[info.owner][lastIndex];
        // delete the last element
        delete ownerToRootComponents[info.owner][lastIndex];
        // repair the length of the array 
        ownerToRootComponents[info.owner].length--;

        // this will reset the struct values
        delete rootComponentToInfo[_childComponent];
    }

    // onlyManager()
    // notInSubmitedForSaleState()
    // notInNeedsRecycledState()
    // notInRecycledOrDestoyedState()
    function removeChildFromParentComponent(
        address _childComponent
    ) 
        external
        onlyManager()
        notRootComponent(_childComponent)
    {
        
        // extracting the owner
        address _owner = getComponentOwner(_childComponent);

        // the removed component becomes a root component
        componentToParent[_childComponent] == address(0); 
        
        // we add the component to the owner components list
        uint256 _index = ownerToRootComponents[_owner].push(_childComponent) - 1;
        
        // creating the component info
        Info memory info = Info({
            owner: _owner,
            index: _index
        });

        rootComponentToInfo[_childComponent] = info;
    }

    function getComponentOwner(address _component) public view returns (address) {
        // if the address is equal to 0x00000
        if (componentToParent[_component] == address(0)) {
            // then it's a root component 
            // and we use the other mapping to get the owner
            return rootComponentToInfo[_component].owner;
        } 
        // else we find the root and return the owner address
        address root = getRootComponentAddress(_component);
        return rootComponentToInfo[root].owner;
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
