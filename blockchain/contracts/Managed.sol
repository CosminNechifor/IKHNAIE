pragma solidity >=0.4 <0.6.0; 

contract Managed { 

    modifier onlyManager() {
        require(isManager(), "Not called from manager contract!");
        _;
    }

    address private _manager;

    constructor (address manager) public {
        _manager = manager;
    }

    function getManager() external view returns(address) {
        return _manager;
    }

    function isManager() public view returns (bool) {
        return msg.sender == _manager;
    }
}
