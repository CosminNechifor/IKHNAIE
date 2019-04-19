pragma solidity >=0.4 <0.6.0; 

import "./Ownable.sol";
import "./IComponent.sol";
import "./IComponentFactory.sol";
import "./IRegistry.sol";

contract Manager is Ownable {

    IComponentFactory private componentFactory;
    IRegistry private registryContract;

    bool private _notLinked;

    modifier notLinked() {
        require(_notLinked, "Contract can no longer be relinked!");
        _;
    }
    
    // TODO: we need a better way to determine this 
    modifier isOwnerOfComponent(address _componentAddress) {
        require(getComponentOwner(_componentAddress) == msg.sender, "Not the owner of this component!");
        _;
    }

    modifier isRootComponent(address _componentAddress) {
        IComponent _component = IComponent(_componentAddress);
        require(_component.getParentComponentAddress() == address(0), "Not a root component!");
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
    

    // TODO: check if I need to verify _parrent component for being a root component
    function addChildComponentToComponent(
        address _parentComponentAddress,
        address _childComponentAddress
    ) 
        public
        isRootComponent(_childComponentAddress)
        isOwnerOfComponent(_parentComponentAddress) 
        isOwnerOfComponent(_childComponentAddress) 
    {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        parentComponent.addChild(_childComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        childComponent.updateConnection(_parentComponentAddress);
    }

    function removeChildComponentFromComponent(
        address _parentComponentAddress, 
        address _childComponentAddress
    ) 
        public 
        isOwnerOfComponent(_parentComponentAddress) 
    {
        IComponent parentComponent = IComponent(_parentComponentAddress);
        parentComponent.removeChild(_childComponentAddress);
        IComponent childComponent = IComponent(_childComponentAddress);
        childComponent.updateConnection(parentComponent.getOwner());
    }
    
    // TODO: needs to be incentivized to do so
    function flagComponentAsExpired(
        address _componentAddress
    ) 
        public
        isOwnerOfComponent(_componentAddress)
    {
        IComponent _component = IComponent(_componentAddress);
        _component.flagAsExpired();

    }

    function flagComponentAsBroken(
        address _componentAddress
    ) 
        public
        isOwnerOfComponent(_componentAddress)
    {
        IComponent _component = IComponent(_componentAddress);
        _component.flagAsBroken();
    }

    function updateComponentName(
        address _componentAddress, 
        string memory _newName 
    ) 
        public 
        isOwnerOfComponent(_componentAddress)
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentName(_newName);
    }

    function updateComponentExpiration(
        address _componentAddress, 
        uint64 _newExpiration 
    ) 
        public 
        isOwnerOfComponent(_componentAddress)
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentExpiration(_newExpiration);
    }

    function updateComponentPrice(
        address _componentAddress,
        uint128 _newPrice
    )
        public
        isOwnerOfComponent(_componentAddress)
    {
        IComponent component = IComponent(_componentAddress);
        component.updateComponentPrice(_newPrice);
    }

    function updateComponentExpiration(
        address _componentAddress,
        string memory _newOtherInformation
    )
        public 
        isOwnerOfComponent(_componentAddress)
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
        IComponent c = getRootComponent(_componentAddress);
        return c.getOwner();
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

    // O(log n) 
    function getRootComponent(address componentAddress) private view returns (IComponent) {
        IComponent c = IComponent(componentAddress);
        while(c.getParentComponentAddress() != address(0)) {
            c = IComponent(c.getParentComponentAddress());
        }
        return c;
    }
}
