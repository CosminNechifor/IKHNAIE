pragma solidity >=0.4 <0.6.0; 

/**
 * Taken from openzeppelin-solidity repository
 * and modified to fit the need
 */
contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor (address owner) internal {
        _owner = owner; 
        emit OwnershipTransferred(address(0), _owner);
    }

    function owner() external view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner(), "Not the contract owner!");
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}
