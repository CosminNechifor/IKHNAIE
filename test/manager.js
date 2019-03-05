const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");
const Component = artifacts.require("Component");

contract('Manager - testing deployment and creation of components [happy case]', function (accounts) {
    
    let managerContract;
    let factoryAddress;


    /**
     * TESTING DEPLOYMENT OF ComponentFactory CONTRACT
     *  */    
    it("Deploy ComponentFactory contract", () => {
        return ComponentFactory.new().then((instance) => {
            factoryAddress = instance.address;
            assert.notEqual(factoryAddress, undefined, "Failed to deploy FactoryContract");
            // console.log(factoryAddress);
        });
    });

    /**
     * TESTING DEPLOYMENT OF ManagerContract USING ALREADY DEPLOYED ComponentFactory
     */
    it("Deploy ManagerContract contract", () => {
        return Manager.new(factoryAddress).then((instance) => {
            managerContract = instance;
            // console.log(managerContract);
            assert.notEqual(managerContract, undefined, "Failed to deploy Manager contract!");
        });
    });

    /**
     * TESTING THE CREATION OF SIMPLE COMPONENT
     */
    it("Create components", () => {
        return managerContract.createComponent("Component0").then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getComponentNumber();
        }).then((componentNumber) => {
            assert.equal(componentNumber.toNumber(), 1, "Creation of the Component0 failed!"); 
        })
    });

    /**
     * TESTING DEPLOYED COMPONENTS DATA 
     */
    it("Get content of registry and access the components", () => {
        return managerContract.createComponent("Component1").then(() => {
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
                    Component.at(component0Address),
                    Component.at(component1Address)
                ]
            );
        }).then((values) => {
            const [component0Contract, component1Contract] = values; 
            return Promise.all(
                [
                    component0Contract.getData(),
                    component1Contract.getData(),
                    component0Contract.getParentComponentAddress(),
                    component1Contract.getParentComponentAddress()
                ]
            );
        }).then((values) => {
            const [dataComponent0, dataComponent1, ,] = values;
            const [ , , parentComponentAddress0, parentComponentAddress1] = values;
            assert.equal(dataComponent0, "Component0", "Data was tampered");
            assert.equal(dataComponent1, "Component1", "Data was tampered");
            assert.equal(parentComponentAddress0, "0x0000000000000000000000000000000000000000", "Data was tampered");
            assert.equal(parentComponentAddress1, "0x0000000000000000000000000000000000000000", "Data was tampered");
        });
    });
});