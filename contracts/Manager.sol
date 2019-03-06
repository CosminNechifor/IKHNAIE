pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./IComponent.sol";
import "./IComponentFactory.sol";

contract Manager is Ownable {

    address[] private _database;

    IComponentFactory componentFactory;

    constructor(address _componentFactoryAddress) Ownable(msg.sender) public {
        componentFactory = IComponentFactory(_componentFactoryAddress);
    }

    function createComponent(string memory _data) public returns(address) {
        address componentAddress = componentFactory.createComponent(_data, msg.sender);
        _database.push(componentAddress);
        return componentAddress;
    }

    function addChildComponentToComponent(address _parentComponentAddress, address _childComponentAddress) public {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        parentComponent.addChild(_childComponentAddress);
        childComponent.updateParentAddress(_parentComponentAddress);
    }

    function removeChildComponentFromComponent(address _parentComponentAddress, uint256 _childIndex) public {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        address childComponentAddress = parentComponent.removeChild(_childIndex);
        IComponent childComponent = IComponent(childComponentAddress);
        childComponent.updateParentAddress(address(0));
    }

    function updateData(address _componentAddress, string memory _data) public {
        IComponent component = IComponent(_componentAddress);
        component.updateData(_data);
    }

    function getChildComponentAddressByIndex(address _parentComponentAddress, uint256 _id) public view returns(address) {
        IComponent component = IComponent(_parentComponentAddress);
        address childAddress = component.getChildComponentAddressByIndex(_id);
        return childAddress;
    }

    function getChildComponentIndexByAddress(address _parentComponentAddress, address _childComponentAddress) public view returns(uint256) {
        IComponent component = IComponent(_parentComponentAddress);
        uint256 childComponentIndex = component.getChildComponentIndexByAddress(_childComponentAddress);
        return childComponentIndex;
    }

    function getComponentData(address _componentAddress) public view returns(string memory){
        IComponent component = IComponent(_componentAddress);
        return component.getData();
    }

    function getComponentOwner(address _componentAddress) public view returns(address) {
        IComponent component = IComponent(_componentAddress);
        return component.owner();
    }

    function getComponentAtIndex(uint256 _index) public view returns(address) {
        return _database[_index];
    }

    function getDatabase() public view returns(address[] memory) {
        return _database;
    }

    function getDatabaseSize() public view returns(uint256) {
        return _database.length;
    }

}
