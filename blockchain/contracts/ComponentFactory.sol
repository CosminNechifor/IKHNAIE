pragma solidity >=0.4.22 <0.6.0;

import "./Component.sol";
import "./IComponentFactory.sol";
import "./Managed.sol";

contract ComponentFactory is IComponentFactory, Managed {

    constructor(address _manager) Managed(_manager) public {}

    function createComponent(
        address _owner,
        string calldata _entityName,
        uint64 _expirationTime,
        uint128 _price,
        string calldata _otherInformation
    )
        external
        returns (address)
    {

        Component c = new Component(
            msg.sender,
            _owner,
            _owner,
            _entityName,
            _expirationTime,
            _price,
            _otherInformation
        );

        return address(c);
    }
}
