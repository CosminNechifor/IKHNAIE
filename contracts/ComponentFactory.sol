pragma solidity >=0.4.22 <0.6.0;

import "./Component.sol";

contract ComponentFactory {

    function createComponent(string calldata _componentData, address _owner) external returns (address){
        Component c = new Component(_componentData, _owner);
        return address(c);
    }
}