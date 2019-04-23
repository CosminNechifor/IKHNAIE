pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./Managed.sol";

/**
 * TODO: 
 * - decide if removeComponent is wanted
 */

contract Registry is Ownable, Managed {

    event ComponentRegistred(
        uint256 indexed _index,
        address indexed _componentAddress
    ); 

    event ComponentRecycled(
        uint256 indexed _index,
        address indexed _componentAddress
    ); 

    event ComponentDestroyed(
        uint256 indexed _index,
        address indexed _componentAddress
    ); 

    // the place where all components in the system are going to be stored
    address[] private _registry;
    mapping(address => uint256) private _addressToIndex;

    constructor(address _manager) Managed(_manager) Ownable(msg.sender) public {}

    function addComponent(address _componentAddress) onlyManager() external {
        uint256 _index = _registry.push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = _index;
        emit ComponentRegistred(_index, _componentAddress);
    }
    
    function componentDestroyed(address _componentAddress) onlyManager() external {
        uint256 _index = _addressToIndex[_componentAddress]; 
        emit ComponentDestroyed(_index, _componentAddress);
    }

    function componentRecycled(address _componentAddress) onlyManager() external {
        uint256 _index = _addressToIndex[_componentAddress]; 
        emit ComponentRecycled(_index, _componentAddress);
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
