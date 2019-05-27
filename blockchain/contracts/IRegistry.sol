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

    struct RecyclerOffer {
        address recyclerAddress;
        uint256 offerValue;
        bool isAccepted;
    }

    function addComponent(address _componentAddress, uint256 _reward) external;
    function componentDestroyed(address _componentAddress) external returns (uint256);
    function componentRecycled(address _componentAddress) external returns (uint256);
    function registerProducer(address _producerAddress, string calldata _name, string calldata _information) external returns (bool);
    function addRecyclerOffer(
        address _componentAddress,
        address _recyclerAddress,
        uint256 _offerValue
    )
        external
        returns(
            bool,
            address,
            uint256,
            bool
        );
    function acceptRecyclerOffer(
        address _componentAddress
    )
        external
        returns (
            address,
            uint256,
            bool
        );
    function confirmProducer(address _producerAddress) external returns (bool);
    function registerRecycler(address _recyclerAddress, string calldata _name, string calldata _information) external returns (bool);
    function confirmRecycler(address _recyclerAddress) external returns (bool);
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
    function getRecyclerOffer(address _componentAddress)
        external
        view
        returns (
            address,
            uint256,
            bool
        );
    function getComponentReward(address _componentAddress) external view returns(uint256);
    function isProducer(address _producerAddress) external view returns (bool);
    function isRecycler(address _recyclerAddress) external view returns (bool);

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

    event RecyclerAddedOffer(
        address indexed _componentAddress,
        address indexed _recyclerAddress,
        uint256 offerValue
    );

    event RecyclerOfferAccepted(
        address indexed _componentAddress,
        address indexed _recyclerAddress,
        bool _isAccepted,
        uint256 offerValue
    );
}
