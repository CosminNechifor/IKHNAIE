pragma solidity >=0.4 <0.6.0; 

import "./IComponentFactory.sol";
import "./IComponent.sol";
import "./Ownable.sol";

contract Manager is Ownable {

    address[] private _registredComponents;

    IComponentFactory componentFactory;

    constructor(address _componentFactoryAddress) Ownable(msg.sender) public {
        componentFactory = IComponentFactory(_componentFactoryAddress);
    }

    function createComponent(string memory _data) public returns(address) {
        address componentAddress = componentFactory.createComponent(_data, msg.sender);
        _registredComponents.push(componentAddress);
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

    function getComponentData(uint256 _componentAddress) public view returns(string memory){
        IComponent component = IComponent(_componentAddress);
        return component.getData();
    }

    function getComponentOwner(address _componentAddress) public view returns(address) {
        IComponent component = IComponent(_componentAddress);
        return component.owner();
    }
}
