pragma solidity >=0.4 <0.6.0; 

import "./IComponentFactory.sol";
import "./IComponent.sol";

contract Manager {

    address owner;

    // replace this with another contract called Database.sol or Registry.sol
    uint256 componentNumber;
    mapping(uint256 => address) public registredComponents;

    event ComponentCreated(uint256 index, address componentAddress);
    event ComponentUpdated(uint256 index, address componentAddress);

    IComponentFactory componentFactory;

    constructor(address _componentFactoryAddress) public {
        componentNumber = 0;
        componentFactory = IComponentFactory(_componentFactoryAddress);
    }

    function createComponent(string memory _data) public returns(address) {
        address componentAddress = componentFactory.createComponent(_data, msg.sender);
        registredComponents[componentNumber] = componentAddress;
        emit ComponentCreated(componentNumber, componentAddress);
        componentNumber++;
        return componentAddress;
    }

    function addChildComponentToComponent(address _parentComponentAddress, address _childComponentAddress) public {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        parentComponent.addChild(_childComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        childComponent.updateParentAddress(_parentComponentAddress);
    }

    function removeChildComponentFromComponent(address _parentComponentAddress, address _childComponentAddress) public {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        parentComponent.removeChild(_childComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        childComponent.updateParentAddress(address(0));
    }

    function updateData(address _componentAddress, string memory _data) public {
        IComponent component = IComponent(_componentAddress);
        component.updateData(_data);
    }

    function getChildComponentAddressById(address _parentComponentAddress, uint256 _id) public view returns(address) {
        IComponent component = IComponent(_parentComponentAddress);
        address childAddress = component.getChildComponentAddressById(_id);
        return childAddress;
    }

    function getChildComponentIndexByAddress(address _parentComponentAddress, address _childComponentAddress) public view returns(uint256) {
        IComponent component = IComponent(_parentComponentAddress);
        uint256 childComponentIndex = component.getChildComponentIndexByAddress(_childComponentAddress);
        return childComponentIndex;
    }

    // TODO: move to registry/database contract
    function getComponentNumber() public view returns(uint) {
        return componentNumber;
    }

    function getComponentAddressRegistredByIndex(uint256 _index) public view returns(address) {
        return registredComponents[_index];
    } 

    function getComponentData(uint256 _componentAddress) public view returns(string memory){
        IComponent component = IComponent(_componentAddress);
        return component.getData();
    }

    function getComponentOwner(address _componentAddress) public view returns(address) {
        IComponent component = IComponent(_componentAddress);
        return component.getOwner();
    }
}
