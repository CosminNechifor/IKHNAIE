const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");
const Component = artifacts.require("Component");
const Registry = artifacts.require("Registry");

contract('Manager - testing deployment and creation of components [happy case]', function (accounts) {
    
    let managerContract;
    let factoryAddress;
    let registryAddress;

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
     * TESTING DEPLOYMENT OF ComponentFactory CONTRACT
     *  */    
    it("Deploy Registry contract", () => {
        return Registry.new().then((instance) => {
            registryAddress = instance.address;
            assert.notEqual(registryAddress, undefined, "Failed to deploy RegistryContract");
        });
    });

    /**
     * TESTING DEPLOYMENT OF ManagerContract USING ALREADY DEPLOYED ComponentFactory
     */
    it("Deploy ManagerContract contract", () => {
        return Manager.new(factoryAddress, registryAddress).then((instance) => {
            managerContract = instance;
            assert.notEqual(managerContract, undefined, "Failed to deploy Manager contract!");
        });
    });

    /**
     * TESTING THE CREATION OF SIMPLE COMPONENT
     */
    it("Create components", () => {
        return managerContract.createComponent(
            "Component0",
            100,
            1000,
            "Some information"
        ).then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getRegistrySize();
        }).then((databaseSize) => {
            assert.equal(databaseSize.toNumber(), 1, "Creation of the Component0 failed!"); 
        })
    });

    /**
     * TESTING DEPLOYED COMPONENTS DATA AND ACESS METHOD 
     */
    it("Get content of registry and access the components", () => {
        return managerContract.createComponent(
            "Component1",
            200,
            2000,
            "Some information"
        ).then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getRegistrySize();
        }).then((databaseSize) => {
            numberOfComponents = databaseSize.toNumber();
            assert.equal(numberOfComponents, 2, "Creation of the Component1 failed!");
            return managerContract.getRegistredComponents();
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
                    component0Contract.getNumberOfChildComponents(),
                    component1Contract.getData(),
                    component1Contract.getNumberOfChildComponents(),
                ]
            );
        }).then((values) => {
            // component1 data
            const result_comp0 = values[0]; 
            const owner0 = result_comp0[0];
            const componentName0 = result_comp0[1];
            const creationgTime0 = result_comp0[2];
            const expiration0 = result_comp0[3];
            const price0 = result_comp0[4];
            const state0 = result_comp0[5];
            const otherInformation0 = result_comp0[6];
            const parentComponentAddress0 = result_comp0[7];
            const childComponentList0 = result_comp0[8];
            const numberOfChildComponents0 = values[1]; 

            // component2 data
            const result_comp1 = values[2]; 
            const owner1 = result_comp1[0];
            const componentName1 = result_comp1[1];
            const creationgTime1 = result_comp1[2];
            const expiration1 = result_comp1[3];
            const price1 = result_comp1[4];
            const state1 = result_comp1[5];
            const otherInformation1 = result_comp1[6];
            const parentComponentAddress1 = result_comp1[7];
            const childComponentList1 = result_comp1[8];
            const numberOfChildComponents1 = values[3]; 


            assert.equal(owner0, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName0, "Component0", "Component name was tampered!!"); 
            assert.equal(expiration0.toNumber(), 100, "Component expiration was tampered!!"); 
            assert.equal(price0.toNumber(), 1000, "Component price was tampered!!"); 
            assert.equal(state0.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation0, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(parentComponentAddress0, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(numberOfChildComponents0.toNumber(), 0, "Wrong number child components!!"); 
            assert.equal(childComponentList0, 0, "Wrong number of child components!!"); 

            assert.equal(owner1, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName1, "Component1", "Component name was tampered!!"); 
            assert.equal(expiration1.toNumber(), 200, "Component expiration was tampered!!"); 
            assert.equal(price1.toNumber(), 2000, "Component price was tampered!!"); 
            assert.equal(state1.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation1, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(parentComponentAddress1, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(numberOfChildComponents1.toNumber(), 0, "Wrong number child components!!"); 
            assert.equal(childComponentList1, 0, "Wrong number of child components!!"); 
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
                managerContract.createComponent(
                    "Component2",
                    300,
                    3000,
                    "Some information"
                ),
                managerContract.createComponent(
                    "Component3",
                    400,
                    4000,
                    "Some information"
                )
            ]
        ).then(() => {
            return managerContract.getRegistredComponents();
        }).then((values) => {
            promiseList = [];
            for (let i = 2; i < values.length; i++) {
                promiseList.push(Component.at(values[i]));
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

            const result_comp2 = values[0]; 
            const owner2 = result_comp2[0];
            const componentName2 = result_comp2[1];
            const creationgTime2 = result_comp2[2];
            const expiration2 = result_comp2[3];
            const price2 = result_comp2[4];
            const state2 = result_comp2[5];
            const otherInformation2 = result_comp2[6];
            const parentComponentAddress2 = result_comp2[7];
            const childComponentList2 = result_comp2[8];

            const result_comp3 = values[1]; 
            const owner3 = result_comp3[0];
            const componentName3 = result_comp3[1];
            const creationgTime3 = result_comp3[2];
            const expiration3 = result_comp3[3];
            const price3 = result_comp3[4];
            const state3 = result_comp3[5];
            const otherInformation3 = result_comp3[6];
            const parentComponentAddress3 = result_comp3[7];
            const childComponentList3 = result_comp3[8];

            assert.equal(owner2, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName2, "Component2", "Component name was tampered!!"); 
            assert.equal(expiration2.toNumber(), 300, "Component expiration was tampered!!"); 
            assert.equal(price2.toNumber(), 3000, "Component price was tampered!!"); 
            assert.equal(state2.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation2, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(parentComponentAddress2, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(childComponentList2.length, 0, "Wrong number of child components!!"); 

            assert.equal(owner3, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName3, "Component3", "Component name was tampered!!"); 
            assert.equal(expiration3.toNumber(), 400, "Component expiration was tampered!!"); 
            assert.equal(price3.toNumber(), 4000, "Component price was tampered!!"); 
            assert.equal(state3.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation3, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(parentComponentAddress3, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(childComponentList3.length, 0, "Wrong number of child components!!"); 
        }).then(() => {
            return managerContract.getRegistredComponents(); 
        }).then((database) => {
            assert.equal(database.length, 4, "Creation of components failed failed!");
            return Promise.all(
                [
                    Component.at(database[0]),
                    managerContract.addChildComponentToComponent(database[0], database[1]),
                    managerContract.addChildComponentToComponent(database[0], database[2]),
                    managerContract.addChildComponentToComponent(database[1], database[3])
                ]
            );
        }).then((values) => {
            const [component0Contract, , , ] = values;
            return component0Contract.getParentComponentAddress();
        }).then((parentAddress) => {
            assert.equal(parentAddress, "0x0000000000000000000000000000000000000000", "Data was tampered");
        });
    });

    it("Stage 2: Travel from component 3 to component 2", () => {
        // We already know where component3 is at index 3
        return managerContract.getRegistredComponentAtIndex(3).then(componentAddress => {
            return Component.at(componentAddress);
        }).then(componentContract => {
            // getting the data and asserting for the content
            return componentContract.getData();
        }).then((result_comp3) => {
            const owner3 = result_comp3[0];
            const componentName3 = result_comp3[1];
            const creationgTime3 = result_comp3[2];
            const expiration3 = result_comp3[3];
            const price3 = result_comp3[4];
            const state3 = result_comp3[5];
            const otherInformation3 = result_comp3[6];
            const parentComponentAddress3 = result_comp3[7];
            const childComponentList3 = result_comp3[8];

            assert.equal(componentName3, "Component3", "Component name was tampered!!"); 
            assert.equal(expiration3.toNumber(), 400, "Component expiration was tampered!!"); 
            assert.equal(owner3, accounts[0], "Wrong number of child components!!"); 
            assert.equal(price3.toNumber(), 4000, "Component price was tampered!!"); 
            assert.equal(state3.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation3, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(childComponentList3.length, 0, "Wrong number of child components!!"); 

            return Component.at(parentComponentAddress3);
        }).then(componentContract => {
            return componentContract.getData();
        }).then((result_comp1) => {
            const owner1 = result_comp1[0];
            const componentName1 = result_comp1[1];
            const creationgTime1 = result_comp1[2];
            const expiration1 = result_comp1[3];
            const price1 = result_comp1[4];
            const state1 = result_comp1[5];
            const otherInformation1 = result_comp1[6];
            const parentComponentAddress1 = result_comp1[7];
            const childComponentList1 = result_comp1[8];

            assert.equal(owner1, accounts[0], "Wrong parent address!!"); 
            assert.equal(componentName1, "Component1", "Component name was tampered!!"); 
            assert.equal(expiration1.toNumber(), 200, "Component expiration was tampered!!"); 
            assert.equal(price1.toNumber(), 2000, "Component price was tampered!!"); 
            assert.equal(state1.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation1, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(childComponentList1.length, 1, "Wrong number of child components!!"); 

            return Component.at(parentComponentAddress1);
        }).then(componentContract => {
            let promiseList = [];
            promiseList.push(componentContract.getData());
            promiseList.push(componentContract.getChildComponentAddressByIndex(1));// we already know that component 2 is at index 1 
            return Promise.all(promiseList);
        }).then((values) => {
            const [componentData, component2Address] = values;

            const owner0 = componentData[0];
            const componentName0 = componentData[1];
            const creationgTime0 = componentData[2];
            const expiration0 = componentData[3];
            const price0 = componentData[4];
            const state0 = componentData[5];
            const otherInformation0 = componentData[6];
            const parentComponentAddress0 = componentData[7];
            const childComponentList0 = componentData[8];

            assert.equal(parentComponentAddress0, "0x0000000000000000000000000000000000000000", "Data was tampered");
            assert.equal(componentName0, "Component0", "Component name was tampered!!"); 
            assert.equal(expiration0.toNumber(), 100, "Component expiration was tampered!!"); 
            assert.equal(owner0, accounts[0], "Wrong number of child components!!"); 
            assert.equal(price0.toNumber(), 1000, "Component price was tampered!!"); 
            assert.equal(state0.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation0, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(childComponentList0.length, 2, "Wrong number of child components!!"); 

            return Component.at(component2Address); 
        }).then(componentContract => {
            return componentContract.getData();
        }).then(result_comp2 => {
            const owner2 = result_comp2[0];
            const componentName2 = result_comp2[1];
            const creationgTime2 = result_comp2[2];
            const expiration2 = result_comp2[3];
            const price2 = result_comp2[4];
            const state2 = result_comp2[5];
            const otherInformation2 = result_comp2[6];
            const parentComponentAddress2 = result_comp2[7];
            const childComponentList2 = result_comp2[8];

            assert.equal(owner2, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName2, "Component2", "Component name was tampered!!"); 
            assert.equal(expiration2.toNumber(), 300, "Component expiration was tampered!!"); 
            assert.equal(price2.toNumber(), 3000, "Component price was tampered!!"); 
            assert.equal(state2.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation2, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.notEqual(parentComponentAddress2, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(childComponentList2.length, 0, "Wrong number of child components!!"); 

        });
    });

    it("Get all children", () => {
        return managerContract.getRegistredComponents().then((values) => {
            componentAddress = values[0];
            return managerContract.getChildComponentListOfAddress(componentAddress);
        }).then((values) => {
            assert.equal(values.length, 2, "getChildComponentListOfAddress failed!"); 
        });
    });

    it("Check for component owner to be accounts[0]", () => {
        return managerContract.getRegistredComponents().then((values) => {
            return Promise.all(
                [
                    managerContract.getComponentOwner(values[0]),
                    managerContract.getComponentOwner(values[1]),
                    managerContract.getComponentOwner(values[2]),
                    managerContract.getComponentOwner(values[3])
                ]
            );
        }).then((values) => {
            assert.equal(values[0], accounts[0], "Ownership is broken!"); 
            assert.equal(values[1], accounts[0], "Ownership is broken!"); 
            assert.equal(values[2], accounts[0], "Ownership is broken!"); 
            assert.equal(values[3], accounts[0], "Ownership is broken!"); 
        });
    });
});
