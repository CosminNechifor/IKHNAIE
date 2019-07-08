pragma solidity >=0.4 <0.6.0;

interface IRegistry {

    struct ProducerStruct {
        string name;
        string information;
        bool isRegistred;
        bool isConfirmed;
    }

    struct RecyclerStruct {
        string name;
        string information;
        uint256 valueRecycled;
        bool isRegistred;
        bool isConfirmed;
    }

    struct RepairerStruct {
        // still have to decide if there is
        // anything else to add
        string name;
        string information;
        bool isRegistred;
        bool isConfirmed;
    }

    function addComponent(address _componentAddress, uint256 _reward) external;
    function componentDestroyed(address _componentAddress) external returns (uint256);
    function componentRecycled(address _componentAddress) external returns (uint256);
    function registerProducer(address _producerAddress, string calldata _name, string calldata _information) external returns (bool);
    function confirmProducer(address _producerAddress) external returns (bool);
    function registerRecycler(address _recyclerAddress, string calldata _name, string calldata _information) external returns (bool);
    function confirmRecycler(address _recyclerAddress) external returns (bool);
    function registerRepairer(address _repairerAddress, string calldata _name, string calldata _information) external returns (bool);
    function confirmRepairer(address _repairerAddress) external returns (bool);
    function getRegistrySize() external view returns(uint256);
    function getRegistredComponentAtIndex(uint256 _index) external view returns(address);
    function getRegistredComponents() external view returns(address[] memory);
    function getProducerInfo(
        address _producerAddress
    )
        external
        view
        returns
        (
            string memory,
            string memory,
            bool,
            bool
        );
    function getRecyclerInfo(address _recyclerAddress)
        external
        view
        returns (
            string memory,
            string memory,
            uint256,
            bool,
            bool
        );
    function getRepairerInfo(
        address _repairerAddress
    )
        external
        view
        returns
        (
            string memory,
            string memory,
            bool,
            bool
        );
    function getComponentReward(address _componentAddress) external view returns(uint256);
    function isProducer(address _producerAddress) external view returns (bool);
    function isRecycler(address _recyclerAddress) external view returns (bool);
    function isRepairer(address _repairerAddress) external view returns (bool);
    function getUserComponents() external view returns (address[] memory);

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

    event RecyclerRegistred(
        address indexed _recyclerAddress
    );

    event RecyclerConfirmed(
        address indexed _recyclerAddress
    );

    event RepairerRegistred(
        address indexed _repairerAddress
    );

    event RepairerConfirmed(
        address indexed _repairerAddress
    );
}
