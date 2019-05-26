pragma solidity >=0.4 <0.6.0;

import "./Managed.sol";
import "./IRegistry.sol";

contract Registry is IRegistry, Managed {

    // the place where all components in the system are going to be stored
    address[] private _registry;
    mapping(address => uint256) private _addressToIndex;
    mapping(address => uint256) private _addressToReward;
    mapping(address => ProducerAuthorization) private _producerAuth;
    mapping(address => RecyclerStruct) private _recyclerToData;

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
        emit ProducerRegistred(_producerAddress);
        return true;
    }

    function confirmProducer(address _producerAddress)
        external
        onlyManager
        returns (bool)
    {
        if (_producerAuth[_producerAddress].isRegistred) {
            _producerAuth[_producerAddress] = ProducerAuthorization({
                isRegistred: true,
                isConfirmed: true 
            });
            emit ProducerConfirmed(_producerAddress);
            return true;
        }

        return false;
    }

    function registerRecycler(
        address _recyclerAddress,
        string calldata _name,
        string calldata _information
    ) 
        external 
        onlyManager 
        returns (bool) 
    {
        _recyclerToData[_recyclerAddress] = RecyclerStruct({
            name: _name,
            information: _information,
            valueRecycled: 0,
            isRegistred: true,
            isConfirmed: false
        });

        return true;
    }

    function confirmRecycler(
        address _recyclerAddress
    ) 
        external
        returns (bool)
    {
        RecyclerStruct storage _recycler = _recyclerToData[_recyclerAddress];

        if (_recycler.isRegistred) {
            _recycler.isConfirmed = true; 
            emit RecyclerConfirmed(_recyclerAddress);
            return true;
        }

        return false;

    }

    function isProducer(address _producerAddress) external view returns (bool) {
        // returns true if this is a certified producer
        return _producerAuth[_producerAddress].isConfirmed;
    }

    function isRecycler(address _recyclerAddress) external view returns (bool) {
        // returns true if this is a certified producer
        return _recyclerToData[_recyclerAddress].isConfirmed;
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

    function getProducerStatus(
        address _producerAddress
    ) 
        external
        view
        returns 
        (
            bool,
            bool
        )
    {
        return (
            _producerAuth[_producerAddress].isRegistred,
            _producerAuth[_producerAddress].isConfirmed
        );
    }

    function getRecyclerInfo(
        address _recyclerAddress 
    ) 
        external
        view
        returns 
        (
            string memory,
            string memory,
            uint256,
            bool,
            bool
        )
    {
        RecyclerStruct memory _recycler = _recyclerToData[_recyclerAddress];
        return (
            _recycler.name,
            _recycler.information,
            _recycler.valueRecycled,
            _recycler.isRegistred,
            _recycler.isConfirmed
        );
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
