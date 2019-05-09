pragma solidity >=0.4 <0.6.0;

import "./Ownable.sol";
import "./Managed.sol";

contract Registry is Ownable, Managed {

    struct Quantities {
        uint256 glass;
        uint256 metal;
        uint256 plastic;
    }

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

    // for now the quantities are not yet used in determining how much tokens one gets
    mapping (address => Quantities) private _addressToQuatities;

    constructor(address _manager) Managed(_manager) Ownable(msg.sender) public {}

    function addComponent(address _componentAddress, uint256 _glassQ, uint256 _metalQ, uint256 _plasticQ) external onlyManager {
        uint256 _index = _registry.push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = _index;
        Quantities memory quantities = Quantities({
            glass: _glassQ,
            metal: _metalQ,
            plastic: _plasticQ
        });
        _addressToQuatities[_componentAddress] = quantities;
        emit ComponentRegistred(_index, _componentAddress);
    }

    function componentDestroyed(address _componentAddress) external onlyManager {
        uint256 _index = _addressToIndex[_componentAddress];
        emit ComponentDestroyed(_index, _componentAddress);
    }

    function componentRecycled(address _componentAddress) external onlyManager {
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
