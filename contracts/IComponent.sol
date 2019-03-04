pragma solidity >=0.4 <0.6.0; 

interface IComponent {
    function addChild(address _childComponentAddress) external;
    function removeChild(address _childComponentAddress) external;
    function updateParentAddress(address _parentComponentAddress) external;
    function updateData(string calldata _data) external;
    function getChildComponentIndexByAddress(address _childComponentAddress) external view returns(uint256); 
    function getChildComponentAddressById(uint256 _childComponentAddress) external view returns(address);
    function getData() external view returns (string memory);
}