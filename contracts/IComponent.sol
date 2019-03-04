pragma solidity >=0.4 <0.6.0; 

interface IComponent {
    function addChild(address _childComponentAddress) external;
    function removeChild(address _childComponentAddress) external;
    function updateParentAddress(address _parrentComponentAddress) external;
    function updateData(string calldata _data) external;
    function getData() external returns (string memory);
}