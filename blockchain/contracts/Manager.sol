pragma solidity >=0.4 <0.6.0;

import "./Ownable.sol";
import "./IComponent.sol";
import "./IComponentFactory.sol";
import "./IRegistry.sol";
import "./IMarketPlace.sol";
import "./IToken.sol";

contract Manager is Ownable {

    IComponentFactory private componentFactory;
    IRegistry private registryContract;
    IMarketPlace private marketPlace;
    IToken private token;

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
        address _componentFactoryAddress,
        address _marketPlaceContractAddress,
        address _tokenContractAddress
    )
        public
        notLinked
        onlyOwner
        returns (bool)
    {
        componentFactory = IComponentFactory(_componentFactoryAddress);
        registryContract = IRegistry(_registryContractAddress);
        marketPlace = IMarketPlace(_marketPlaceContractAddress);
        token = IToken(_tokenContractAddress);
        _notLinked = false;

        return true;
    }

    function deposit() public payable {
        require(
            token.mint(msg.sender, msg.value),
            "Token minting failed!"
        );
    }

    // function test_case() external {
    //     require(
    //         token.mint(address(this), 200),
    //         "Token minting failed!"
    //     );
    //     token.transfer(address(this), msg.sender, 100);
    // }

    function withdraw(uint256 value) public {
        token.withdraw(msg.sender, value);
        msg.sender.transfer(value);
    }

    function createComponent(
        string memory _entityName,
        uint64 _expirationTime,
        uint128 _price,
        string memory _otherInformation
    )
        public
        payable
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
        registryContract.addComponent(componentAddress, msg.value);
        require(
            token.mint(address(this), msg.value),
            "Token minting failed!"
        );
        return componentAddress;
    }

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

    function submitComponentToMarket(
        address _componentAddress
    )
        public
        isOwnerOfComponent(_componentAddress)
    {
        IComponent _c = IComponent(_componentAddress);
        require(_c.submitForSale(), "Component couldn't be submited for sale.");
        require(
            marketPlace.submitForSale(msg.sender, _componentAddress),
            "Component could not be added to market."
        );
    }

    function removeComponentFromMarket(
        address _componentAddress
    )
        public
        isOwnerOfComponent(_componentAddress)
    {
        IComponent _c = IComponent(_componentAddress);
        require
        (
            _c.removeFromSale(),
            "Component failed to be removed from market."
        );
        require
        (
            marketPlace.removeFromSale(msg.sender, _componentAddress),
            "Component failed to be removed from market."
        );
    }

    function addOffer(address _componentAddress, uint256 _amount) public {
        marketPlace.addOffer(msg.sender, _componentAddress, _amount);
        token.approve(msg.sender, getComponentOwner(_componentAddress), _amount);
    }

    function removeOffer(address _componentAddress, uint256 _offerIndex) public {
        require
        (
            marketPlace.removeOffer(
                msg.sender,
                _componentAddress,
                _offerIndex
            ),
            "Failed to remove the offer"
        );
        require
        (
            token.approve(msg.sender, getComponentOwner(_componentAddress), 0),
            "Token allowence failed to be removed!"
        );
    }

    function acceptOffer(address _componentAddress, uint256 _offerIndex)
        public
        isOwnerOfComponent(_componentAddress)
    {
        address _newOwner;
        uint256 _tokenAmount;
        (
            _newOwner,
            _tokenAmount
        ) = marketPlace.acceptOffer(msg.sender, _componentAddress, _offerIndex);
        IComponent _c = IComponent(_componentAddress);
        require(_c.transferOwnership(_newOwner), "Ownership was not Trasfered");
        require(
            token.transferFrom(msg.sender, _newOwner, msg.sender, _tokenAmount),
            "Token transfer didn't take place."
        );
    }

    function rejectOffer(address _componentAddress, uint256 _offerIndex)
        public
        isOwnerOfComponent(_componentAddress)
    {
        marketPlace.rejectOffer(_componentAddress, _offerIndex);
    }

    function modifyAllowance(address _spender, uint256 _value)
        public
    {
       token.approve(msg.sender, _spender, _value);
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

    // TODO: find a way to lock till the reparation is confirmed
    // TODO: incentivized actors
    function repair(
        address _componentAddress
    )
        public
    {
        IComponent _component = IComponent(_componentAddress);
        _component.repair(msg.sender);
        // pay with tokens
    }

    // TODO: find a way to lock till the recycle is confirmed
    // TODO: incentivized actors
    function recycle(
        address _componentAddress
    )
        public
        isRootComponent(_componentAddress)
    {
        IComponent _component = IComponent(_componentAddress);
        _component.recycle(msg.sender);
        // pay with tokens
    }

    // TODO: find a way to lock till the destruction is confirmed
    // TODO: actor must not be incentivized
    function destroy(
        address _componentAddress
    )
        public
        isRootComponent(_componentAddress)
    {
        IComponent _component = IComponent(_componentAddress);
        _component.destroy(msg.sender);
        // pay with tokens
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

    // TODO: add test
    // a root component can be transfered without asking for tokens
    // in return
    function transferComponentOwnership(
        address _componentAddress,
        address _newOwner
    )
        public
        isOwnerOfComponent(_componentAddress)
        isRootComponent(_componentAddress)
    {
        IComponent component = IComponent(_componentAddress);
        component.transferOwnership(_newOwner);
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

    function getRegistrySize() external view returns(uint256) {
        return registryContract.getRegistrySize();
    }

    function getRegistredComponentAtIndex(uint256 _index) external view returns(address) {
        return registryContract.getRegistredComponentAtIndex(_index);
    }

    function getRegistredComponents() external view returns(address[] memory) {
        return registryContract.getRegistredComponents();
    }

    function getComponentsSubmitedForSale() external view returns(address[] memory) {
        return marketPlace.getComponentsSubmitedForSale();
    }

    function getComponentOfferSize(address _componentAddress) external view returns(uint256) {
        return marketPlace.getComponentOfferSize(_componentAddress);
    }

    function getComponentOfferByIndex(address _componentAddress, uint256 _index) external view returns(uint256, address) {
        return marketPlace.getComponentOfferByIndex(_componentAddress, _index);
    }

    function balance() external view returns (uint256) {
        return token.balanceOf(msg.sender);
    }

    function getAllowance(address _spender) public view returns(uint256) {
        return token.allowance(msg.sender, _spender);
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
