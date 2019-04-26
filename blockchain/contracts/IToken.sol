pragma solidity >=0.4 <0.6.0; 

interface IToken {

    function transfer(address msg_sender, address to, uint256 value) external returns (bool);
    function approve(address msg_sender, address spender, uint256 value) external returns (bool);
    function disapprove(address msg_sender, address spender) external returns (bool);
    function transferFrom(address msg_sender, address from, address to, uint256 value) external returns (bool);
    function mint(address to, uint256 value) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Disapproval(address indexed owner, address indexed spender);
}
