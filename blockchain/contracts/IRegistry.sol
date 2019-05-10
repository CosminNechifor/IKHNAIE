pragma solidity >=0.4 <0.6.0;

interface IRegistry {
    function addComponent(address _componentAddress, uint256 _reward) external;
    function componentDestroyed(address _componentAddress) external;
    function componentRecycled(address _componentAddress) external;
    function getRegistrySize() external view returns(uint256);
    function getRegistredComponentAtIndex(uint256 _index) external view returns(address);
    function getRegistredComponents() external view returns(address[] memory);

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
}
