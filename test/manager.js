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
        });
    });

    /**
     * TESTING DEPLOYMENT OF ManagerContract USING ALREADY DEPLOYED ComponentFactory
     */
    it("Deploy ManagerContract contract", () => {
        return Manager.new(factoryAddress).then((instance) => {
            managerContract = instance;
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
     * TESTING DEPLOYED COMPONENTS DATA AND ACESS METHOD 
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
            assert.equal(dataComponent0, "Component0", "Data was tampered!");
            assert.equal(dataComponent1, "Component1", "Data was tampered!");
            // assert address equals 0x0 means that the component has no parent
            assert.equal(parentComponentAddress0, "0x0000000000000000000000000000000000000000", "Data was tampered");
            assert.equal(parentComponentAddress1, "0x0000000000000000000000000000000000000000", "Data was tampered");
        });
    });


    /**
     * THIS IS TESTING FOR THE CEATION OF NESTED COMPONENTS 
     * AND ALSO FOR THE ABILITY TO TRAVEL THE TREE OF COMPONENTS
     * WITHOUT CONSUMING GAS.
     * 
     * Create the folowing tree:
     *       Component0
     *      /         \
     *  Component1  Component2 <===== END
     *      |
     *  Component3  <================ START 
     * 
     * And ensure that it can be traveled from Component3 to Component2
     */

    it("Stage 1: Create a tree of components", () => {
        return Promise.all(
            [
                managerContract.createComponent("Component2"),
                managerContract.createComponent("Component3")
            ]
        ).then((transactions) => {
            let promiseList = [];

            for(const tx of transactions) {
                promiseList.push(Component.at(tx.logs[0].args[1]));
            }

            return Promise.all(promiseList);

        }).then((values) => {
            const [component2Contract, component3Contract] = values;
            return Promise.all(
                [
                    component2Contract.getData(),
                    component3Contract.getData()
                ]
            );
        }).then((values) => {
            assert.equal(values[0], "Component2", "Data was tampered!");
            assert.equal(values[1], "Component3", "Data was tampered!");
        }).then(() => {
            return managerContract.getComponentNumber(); 
        }).then((componentNumber) => {
            let promiseArray = [];
            for(let i = 0; i < componentNumber; i++){
                promiseArray.push(managerContract.getComponentAddressRegistredByIndex(i));
            }
            return Promise.all(promiseArray);
        }).then(values => {
            let promiseList = [];            

            const [comp0Adr, comp1Adr, comp2Adr, comp3Adr] = values;

            // creating the binary tree
            promiseList.push(Component.at(comp0Adr));
            promiseList.push(managerContract.addChildComponentToComponent(comp0Adr, comp1Adr));
            promiseList.push(managerContract.addChildComponentToComponent(comp0Adr, comp2Adr));
            promiseList.push(managerContract.addChildComponentToComponent(comp1Adr, comp3Adr));

            return Promise.all(promiseList);
        }).then((values) => {
            const [component0Contract, , , ] = values;
            return component0Contract.getParentComponentAddress();
        }).then((parentAddress) => {
            assert.equal(parentAddress, "0x0000000000000000000000000000000000000000", "Data was tampered");
        });
    });

    it("Stage 2: Travel from component 3 to component 2", () => {
        // We already know where component3 is
        return managerContract.getComponentAddressRegistredByIndex(3).then(componentAddress => {
            return Component.at(componentAddress);
        }).then(componentContract => {
            // getting the data and asserting for the content
            let promiseList = [];
            promiseList.push(componentContract.getData());
            promiseList.push(componentContract.getParentComponentAddress());
            return Promise.all(promiseList);
        }).then((values) => {
            const [componentData, parrentComponentAddress] = values;
            assert.equal(componentData, "Component3", "Not the right component!");
            return Component.at(parrentComponentAddress);
        }).then(componentContract => {
            // getting the data and asserting for the content
            let promiseList = [];
            promiseList.push(componentContract.getData());
            promiseList.push(componentContract.getParentComponentAddress());
            return Promise.all(promiseList);
        }).then((values) => {
            const [componentData, parrentComponentAddress] = values;
            assert.equal(componentData, "Component1", "Not the right component!");
            return Component.at(parrentComponentAddress);
        }).then(componentContract => {
            let promiseList = [];
            promiseList.push(componentContract.getData());
            promiseList.push(componentContract.getParentComponentAddress());
            promiseList.push(componentContract.getChildComponentAddressById(1));// we already know that comppnent 2 is at index 1 
            return Promise.all(promiseList);
        }).then((values) => {
            const [componentData, parentComponentAddress, component2Address] = values;
            assert.equal(parentComponentAddress, "0x0000000000000000000000000000000000000000", "Data was tampered");
            assert.equal(componentData, "Component0", "Not the right component!");
            return Component.at(component2Address); 
        }).then(componentContract => {
            let promiseList = [];
            return componentContract.getData();
        }).then(componentData => {
            assert.equal(componentData, "Component2", "Not the right component!");
        });
    });
});