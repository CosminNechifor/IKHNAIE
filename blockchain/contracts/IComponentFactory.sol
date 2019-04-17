pragma solidity >=0.4.22 <0.6.0;

interface IComponentFactory {

    function createComponent(
        string calldata _entityName,
        uint64 _expirationTime,
        uint128 _price,
        string calldata _otherInformation
    ) 
        external 
        returns 
        (
            address
        );
}
