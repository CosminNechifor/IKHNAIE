pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./IComponent.sol";
import "./IComponentFactory.sol";
import "./IRegistry.sol";

contract Manager is Ownable {

    IComponentFactory componentFactory;
    IRegistry registryContract;

    bool private _notLinked;

    modifier notLinked() {
        require(_notLinked, "Contract can no longer be relinked");
        _;
    }

    constructor() Ownable(msg.sender) public {
        _notLinked = true;
    }
    
    function link(
        address _registryContractAddress,
        address _componentFactoryAddress
    )
        notLinked()
        onlyOwner()
        public
        returns (bool)
    {
        componentFactory = IComponentFactory(_componentFactoryAddress);
        registryContract = IRegistry(_registryContractAddress);
        _notLinked = false;
        return true;
    }

    function createComponent(
        string memory _entityName,
        uint64 _expirationTime,
        uint128 _price,
        string memory _otherInformation
    ) 
        public 
        returns
        (
            address
        ) 
    {
        address componentAddress = componentFactory.createComponent(
            msg.sender,
            _entityName,
            _expirationTime,
            _price,
            _otherInformation
        );
        registryContract.addComponent(componentAddress);
        return componentAddress;
    }

    function addChildComponentToComponent(
        address _parentComponentAddress,
        address _childComponentAddress
    ) 
        public 
    {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        parentComponent.addChild(_childComponentAddress);
        childComponent.updateParentAddress(_parentComponentAddress);
    }

    function removeChildComponentFromComponent(
        address _parentComponentAddress, 
        uint256 _childIndex
    ) 
        public 
    {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        address childComponentAddress = parentComponent.removeChild(_childIndex);
        IComponent childComponent = IComponent(childComponentAddress);
        childComponent.updateParentAddress(address(0));
    }

    function updateComponentName(
        address _componentAddress, 
        string memory _newName 
    ) 
        public 
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentName(_newName);
    }

    function updateComponentExpiration(
        address _componentAddress, 
        uint64 _newExpiration 
    ) 
        public 
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentExpiration(_newExpiration);
    }

    function updateComponentPrice(
        address _componentAddress,
        uint128 _newPrice
    )
        public
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentPrice(_newPrice);
    }

    function updateComponentExpiration(
        address _componentAddress,
        string memory _newOtherInformation
    )
        public 
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentOtherInformation(_newOtherInformation);
    }

    function getChildComponentAddressByIndex(
        address _parentComponentAddress,
        uint256 _id
    ) 
        public 
        view 
        returns
        (
            address
        ) 
    {
        IComponent component = IComponent(_parentComponentAddress);
        address childAddress = component.getChildComponentAddressByIndex(_id);
        return childAddress;
    }

    function getChildComponentIndexByAddress(
        address _parentComponentAddress, 
        address _childComponentAddress
    ) 
        public 
        view 
        returns
        (
            uint256
        ) 
    {
        IComponent component = IComponent(_parentComponentAddress);
        uint256 childComponentIndex = component.getChildComponentIndexByAddress(_childComponentAddress);
        return childComponentIndex;
    }

    function getChildComponentListOfAddress(
        address _parentComponentAddress
    ) 
        public 
        view 
        returns
        (
            address[] memory
        )
    {
        IComponent component = IComponent(_parentComponentAddress);
        address[] memory childrenList = component.getChildComponentList();
        return childrenList;
    }

    function getComponentData(
        address _componentAddress
    ) 
        public 
        view 
        returns
        (
            address, 
            string memory, 
            uint256, 
            uint64, 
            uint128, 
            uint8, 
            string memory, 
            address, 
            address[] memory
        )
    {
        IComponent component = IComponent(_componentAddress);
        return component.getData();
    }

    function getComponentOwner(address _componentAddress) public view returns(address) {
        IComponent component = IComponent(_componentAddress);
        return component.getOwner();
    }

    function getRegistrySize() public view returns(uint256) {
        return registryContract.getRegistrySize();
    }

    function getRegistredComponentAtIndex(uint256 _index) public view returns(address) {
        return registryContract.getRegistredComponentAtIndex(_index);
    }

    function getRegistredComponents() public view returns(address[] memory) {
        return registryContract.getRegistredComponents();
    }
}
