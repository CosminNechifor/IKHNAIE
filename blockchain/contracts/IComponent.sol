pragma solidity >=0.4 <0.6.0; 

contract IComponent{

    function updateComponentName(string calldata _componentName) external;
    function updateParentAddress(address _parentComponentAddress) external;
    function updateComponentExpiration(uint64 _expiration) external;
    function updateComponentPrice(uint128 _price) external;
    function updateComponentOtherInformation(string calldata _otherInformation) external;
    function addChild(address _childComponentAddress) external;
    function removeChild(uint256 _index) external;
    function flagAsExpired() external;
    function getData() external view returns (
        address, 
        string memory, 
        uint256, 
        uint64, 
        uint128, 
        uint8, 
        string memory, 
        address, 
        address[] memory
    );
    function getParentComponentAddress() external view returns (address);
    function getNumberOfChildComponents() external view returns (uint256);
    function getChildComponentAddressByIndex(uint256 _index) external view returns (address);
    function getchildcomponentindexbyaddress(address _address) external view returns (uint256);
}
