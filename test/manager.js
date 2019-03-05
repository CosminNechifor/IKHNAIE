const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");

contract('Manager - testing deployment and creation of components [happy case]', function (accounts) {
    
    let managerContract;
    let factoryAddress;

    it("Deploy ComponentFactory contract", () => {
        return ComponentFactory.new().then((instance) => {
            factoryAddress = instance.address;
            assert.notEqual(factoryAddress, undefined, "Failed to deploy FactoryContract");
            // console.log(factoryAddress);
        });
    });

    it("Deploy ManagerContract contract", () => {
        return Manager.new(factoryAddress).then((instance) => {
            managerContract = instance;
            // console.log(managerContract);
            assert.notEqual(managerContract, undefined, "Failed to deploy Manager contract!");
        });
    });

    it("Create components", () => {
        return managerContract.createComponent("Component0").then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getComponentNumber();
        }).then((componentNumber) => {
            assert.equal(componentNumber.toNumber(), 1, "Creation of the Component0 failed!"); 
        })
    });

    it("Get content of registry", () => {
        return managerContract.createComponent("component2").then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getComponentNumber();
        }).then((componentNumber) => {
            numberOfComponents = componentNumber.toNumber();
            assert.equal(numberOfComponents, 2, "Creation of the Component1 failed!");
            return Promise.all(
                [
                    managerContract.getComponentAddressRegistredByIndex(0),
                    managerContract.getComponentAddressRegistredByIndex(1)
                ]
            );
        }).then((values) => {
            const [component0Address, component1Address] = values;
            assert.notEqual(component0Address, undefined, "GetComponentAddressREgistredByIndex failed!");
            assert.notEqual(component1Address, undefined, "GetComponentAddressREgistredByIndex failed!");
            return Promise.all(
                [
                    
                ]
            );
        });
    });
});