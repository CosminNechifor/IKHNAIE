pragma solidity >=0.4 <0.6.0;

interface IRegistry {

    struct ProducerAuthorization {
        bool isRegistred;
        bool isConfirmed;
    }

    function addComponent(address _componentAddress, uint256 _reward) external;
    function componentDestroyed(address _componentAddress) external returns (uint256);
    function componentRecycled(address _componentAddress) external returns (uint256);
    function registerProducer(address _producerAddress) external returns (bool);
    function confirmProducer(address _producerAddress) external returns (bool);
    function getRegistrySize() external view returns(uint256);
    function getRegistredComponentAtIndex(uint256 _index) external view returns(address);
    function getRegistredComponents() external view returns(address[] memory);
    function getProducerStatus(address _producerAddress) external view returns (bool, bool);
    function getComponentReward(address _componentAddress) external view returns(uint256);
    function isProducer(address _producerAddress) external view returns (bool);

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

    event ProducerRegistred(
        address indexed _producerAddress
    );

    event ProducerConfirmed(
        address indexed _producerAddress
    );
}
