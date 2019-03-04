const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");

contract('Manager - testing deployment and creation of components [happy case]', function (accounts) {
    
    let managerContract;
    let factoryAddress;

    it("Deploy ComponentFactory contract", function () {
        return ComponentFactory.new().then(function (instance) {
            factoryAddress = instance.address;
            assert.notEqual(factoryAddress, undefined, "Failed to deploy FactoryContract");
            // console.log(factoryAddress);
        });
    });

    it("Deploy ManagerContract contract", function() {
        return Manager.new(factoryAddress).then(function(instance){
            managerContract = instance;
            // console.log(managerContract);
            assert.notEqual(managerContract, undefined, "Failed to deploy Manager contract");
        });
    });

    it("Create components", function() {
        return managerContract.createComponent("component1").then(function() {
            //check if componentRegistred has the rigth number of components
            return managerContract.getComponentNumber();
        }).then(function(componentNumber) {
            assert.equal(componentNumber.toNumber(), 1, "Creation of the component failed"); 
        })
    });

});