pragma solidity >=0.4 <0.6.0;

import "./Managed.sol";
import "./IRegistry.sol";

contract Registry is IRegistry, Managed {

    // the place where all components in the system are going to be stored
    address[] private _registry;
    mapping(address => uint256) private _addressToIndex;
    mapping(address => uint256) private _addressToReward;
    mapping(address => ProducerAuthorization) private _producerAuth;

    constructor(address _manager) Managed(_manager) public {}

    function addComponent(address _componentAddress, uint256 _reward) external onlyManager {
        uint256 _index = _registry.push(_componentAddress) - 1;
        _addressToIndex[_componentAddress] = _index;
        _addressToReward[_componentAddress] = _reward;
        emit ComponentRegistred(_index, _componentAddress);
    }

    function componentDestroyed(address _componentAddress)
        external
        onlyManager
        returns (uint256)
    {
        uint256 _index = _addressToIndex[_componentAddress];
        emit ComponentDestroyed(_index, _componentAddress);
        return _addressToReward[_componentAddress];
    }

    function componentRecycled(address _componentAddress)
        external
        onlyManager
        returns (uint256)
    {
        uint256 _index = _addressToIndex[_componentAddress];
        emit ComponentRecycled(_index, _componentAddress);
        return _addressToReward[_componentAddress];
    }

    function registerProducer(address _producerAddress)
        external
        onlyManager
        returns (bool)
    {
        _producerAuth[_producerAddress] = ProducerAuthorization({
            isRegistred: true,
            isConfirmed: false
        });
        return true;
    }

    function confirmProducer(address _producerAddress)
        external
        onlyManager
        returns (bool)
    {
        _producerAuth[_producerAddress] = ProducerAuthorization({
            isRegistred: true,
            isConfirmed: true 
        });
        return true;
    }

    function isProducer(address _producerAddress) external view returns (bool) {
        return _producerAuth[_producerAddress].isConfirmed;
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

    function getComponentReward(
        address _componentAddress
    )
        external
        view
        returns(uint256)
    {
        return _addressToReward[_componentAddress];
    }
}
