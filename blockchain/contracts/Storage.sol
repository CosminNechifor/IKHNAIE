pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./Management.sol";

contract Storage is Ownable, Management {

    struct Info {
        address ownerOrComponentAddress; // address of the owner or component
        uint256 index; // index inside the RootComponentList
    }

    modifier isRootComponent(address _componentAddress) {
        require(componentToParent[_componentAddress].ownerOrComponentAddress == address(0));
        _;
    }

    modifier notRootComponent(address _componentAddress) {
        require(componentToParent[_componentAddress].ownerOrComponentAddress != address(0));
        _;
    }

    // This would be helpful in the determination of the parent component of a component
    mapping(address => Info) private componentToParent;

    // Helpful when finding what components does this owner own. 
    mapping (address => address[]) private ownerToRootComponents;
    
    // Having the address of a root component we can easily discover which is the owner
    // and we dont have to go over all the values of the mapping above. 
    mapping (address => Info) private rootComponentToOwnerInfo; 

    // Storing the child components of a component
    mapping (address => address[]) private parentToComponents;

    constructor(address _manager) Management(_manager) Ownable(msg.sender) public {}

    function mapComponentToOwner(address _component, address _owner) onlyManager() external {
        uint256 _index = ownerToRootComponents[_owner].push(_component) - 1; 
        Info memory info = Info({
            ownerOrComponentAddress: _owner,
            index: _index
        });
        rootComponentToOwnerInfo[_component] = info;
        Info memory componentToParentInfo = Info({
            ownerOrComponentAddress: address(0), // meaning the component doesn't have a parent
            index: 0 // it doesn't matter the index as long ass the above field is set to address(0)
        });

        // if the ownerOrComponentAddress == address(0) it means that
        // this is a root component
        componentToParent[_component] = componentToParentInfo;  
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
        
        // extract information
        Info storage info = rootComponentToOwnerInfo[_childComponent];
        // perform reconstruction of the data structures
        uint256 lastIndex = ownerToRootComponents[info.ownerOrComponentAddress].length - 1;
        // put the last element where the old root component was
        ownerToRootComponents[info.ownerOrComponentAddress][info.index] =
            ownerToRootComponents[info.ownerOrComponentAddress][lastIndex];
        // delete the last element
        delete ownerToRootComponents[info.ownerOrComponentAddress][lastIndex];
        // repair the length of the array 
        ownerToRootComponents[info.ownerOrComponentAddress].length--;
        // this will reset the struct values
        delete rootComponentToOwnerInfo[_childComponent];

        uint256 _index = parentToComponents[_parentComponent].push(_childComponent) - 1;
        Info memory componentToParentInfo = Info({
            ownerOrComponentAddress: _parentComponent, 
            index: _index 
        });
        componentToParent[_childComponent] = componentToParentInfo;
    }

    // onlyManager()
    // notInSubmitedForSaleState()
    // notInNeedsRecycledState()
    // notInRecycledOrDestoyedState()
    function removeChildFromParentComponent(
        address _childComponent,
        address _parentComponent
    ) 
        external
        onlyManager()
        notRootComponent(_childComponent)
    {
        
        // extracting the owner
        address _owner = getComponentOwner(_childComponent);


        uint256 indexInParentChildList = componentToParent[_childComponent].index;
        uint256 lastComponentIndex = parentToComponents[_parentComponent].length - 1;
        
        // remove it from parent to componentn list
        parentToComponents[_parentComponent][indexInParentChildList] =
            parentToComponents[_parentComponent][lastComponentIndex];
        delete parentToComponents[_parentComponent][lastComponentIndex];
        parentToComponents[_parentComponent].length--;

        // the removed component becomes a root component
        componentToParent[_childComponent].ownerOrComponentAddress = address(0); 

        // we add the component to the owner components list
        uint256 _index = ownerToRootComponents[_owner].push(_childComponent) - 1;
        
        // creating the component info
        Info memory info = Info({
            ownerOrComponentAddress: _owner,
            index: _index
        });

        rootComponentToOwnerInfo[_childComponent] = info;
    }

    function getComponentOwner(address _component) public view returns (address) {
        // if the address is equal to 0x00000
        if (componentToParent[_component].ownerOrComponentAddress == address(0)) {
            // then it's a root component 
            // and we use the other mapping to get the owner
            return rootComponentToOwnerInfo[_component].ownerOrComponentAddress;
        } 
        // else we find the root and return the owner address
        address root = getRootComponentAddress(_component);
        return rootComponentToOwnerInfo[root].ownerOrComponentAddress;
    }

    function getRootComponentAddress(address _component) internal view returns (address) {
        address root = componentToParent[_component].ownerOrComponentAddress; 
        while(componentToParent[root].ownerOrComponentAddress != address(0)) {
            root = componentToParent[root].ownerOrComponentAddress;
        }
        return root;
    }

    // also known as get owner all components
    function getOwnerRootComponents(address _owner) external view returns (address[] memory) {
        return ownerToRootComponents[_owner];
    }

    function getChildComponentListOfAddress(address _component) external view returns (address[] memory) {
        return parentToComponents[_component];
    }
}
