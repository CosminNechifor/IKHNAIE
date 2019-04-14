pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./Management.sol";

/**
 * TODO: 
 * - decide if removeComponent is wanted
 */

contract Registry is Ownable, Management {

    // the place where all components in the system are going to be stored
    address[] private _registry;

    constructor(address _manager) Management(_manager) Ownable(msg.sender) public {}

    function addComponent(address _componentAddress) onlyManager() external {
        _registry.push(_componentAddress);
    }

    function removeComponent(uint256 _index) onlyManager() external {
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
