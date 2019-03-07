pragma solidity >=0.4 <0.6.0; 

/**
 * TODO: 
 * - add modifier to allow only the Manager to perform operations
 * - decide if removeComponent is wanted
 */

contract Registry {

    // the place where all components in the system are going to be stored
    address[] private _registry;

    function addComponent(address _componentAddress) external {
        _registry.push(_componentAddress);
    }

    // TODO: migh need to be changed/removed 
    function removeComponent(uint256 _index) external {
        uint256 lastElementIndex = _registry.length - 1;
        address _componentAddress = _registry[lastElementIndex]; 

        _registry[_index] = _componentAddress;
        
        // delete the element and enusre there is no empty space
        delete _registry[lastElementIndex];
        _registry.length--;
    }

    function getRegistrySize() external view returns(uint256) {
        return _registry.length;
    }

    function getRegistredComponentAtIndex(
        uint256 _index
    )
        external
        view
        returns(address)
    {
        return _registry[_index];
    }

    function getRegistredComponents() 
        external 
        view 
        returns(address[] memory)
    {
        return _registry;
    }

}