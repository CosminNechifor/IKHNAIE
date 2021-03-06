pragma solidity >=0.4 <0.6.0;

import "./library/SafeMath.sol";
import "./IToken.sol";
import "./Managed.sol";

contract Token is IToken, Managed {

    using SafeMath for uint256;

    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowed;

    uint256 private _totalSupply;

    constructor (address _manager) Managed(_manager) public {}
    
    // mainly used by the manager
    function transfer(address to, uint256 value) external onlyManager returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external onlyManager returns (bool) {
        _approve(tx.origin, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external onlyManager returns (bool) {
        _transfer(from, to, value);
        _approve(from, tx.origin, _allowed[from][tx.origin].sub(value));
        return true;
    }

    function mint(address to, uint256 value) external onlyManager returns (bool) {
        _mint(to, value);
        return true;
    }

    function withdraw(address to, uint256 value) external onlyManager returns(bool) {
        _totalSupply = _totalSupply.sub(value);
        _balances[to] = _balances[to].sub(value);
        emit Transfer(to, address(0), value);
    }

    function totalSupply() external onlyManager view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view returns (uint256) {
        return _balances[owner];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowed[owner][spender];
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "Address should not be address(0)");

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(spender != address(0), "Spender should not be address(0)");
        require(owner != address(0), "Owner should not be address(0)");

        _allowed[owner][spender] = value;

        if (value == 0) {
            emit Disapproval(owner, spender);
        } else {
            emit Approval(owner, spender, value);
        }
    }

    function _mint(address account, uint256 value) internal {
        require(account != address(0), "Account should not be address(0)");

        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }
}
