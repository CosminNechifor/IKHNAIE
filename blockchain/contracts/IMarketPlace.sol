pragma solidity >=0.4 <0.6.0; 

interface IMarketPlace { 
    function submitForSale(address _owner, address _componentAddress) external returns (bool);
    function removeFromSale( address _owner, address _componentAddress) external returns (bool);
    function addOffer( address _sender, address _componentAddress, uint256 _amount) external;
    function acceptOffer( address _owner, address _componentAddress, uint256 _offerIndex) external returns (address, uint256);
    function rejectOffer(address _componentAddress, uint256 _offerIndex) external returns (bool);
    function removeOffer(address _sender, address _componentAddress, uint256 _offerIndex) external returns (bool); 
    function getComponentsSubmitedForSale() external view returns (address[] memory);
    function getOwnerComonentsSubmitedForSale( address _owner) external view returns(address[] memory); 
    function getComponentOfferByIndex( address _componentAddress, uint256 _index) external view returns (uint256, address);
    function getComponentOfferSize( address _componentAddress) external view returns(uint256); 
}
