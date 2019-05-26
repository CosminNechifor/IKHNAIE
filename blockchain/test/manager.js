const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");
const Component = artifacts.require("Component");
const Registry = artifacts.require("Registry");
const MarketPlace = artifacts.require("MarketPlace");
const SafeMath = artifacts.require("SafeMath");
const Token = artifacts.require("Token");

const mineTx = require("./mineTx.js");

contract('Manager - testing deployment and creation of components [happy case]', function (accounts) {
    
    let managerContract;
    let factoryAddress;
    let registryAddress;
    let marketPlaceAddress;
    let tokenAddress;

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    it("Deploy ManagerContract contract", () => {
        return Manager.new().then((instance) => {
            managerContract = instance;
            assert.notEqual(managerContract, undefined, "Failed to deploy Manager contract!");
        });
    });

    /**
     * TESTING DEPLOYMENT OF ComponentFactory CONTRACT 
     * using the manager address as argument for the constructor
     *  */    
    it("Deploy ComponentFactory contract", () => {
        return ComponentFactory.new(managerContract.address).then((instance) => {
            factoryAddress = instance.address;
            assert.notEqual(factoryAddress, undefined, "Failed to deploy FactoryContract");
        });
    });

    /**
     * TESTING DEPLOYMENT OF ComponentFactory CONTRACT 
     * using the manager address as argument for the constructor
     *  */    
    it("Deploy Registry contract", () => {
        return Registry.new(managerContract.address).then((instance) => {
            registryAddress = instance.address;
            assert.notEqual(registryAddress, undefined, "Failed to deploy RegistryContract");
        });
    });

    /**
     * TESTING DEPLOYMENT OF MarketPlace CONTRACT 
     * using the manager address as argument for the constructor
     *  */    
    it("Deploy MarketPlace contract", async () => {
        const marketContract = await MarketPlace.new(managerContract.address);
        marketPlaceAddress = marketContract.address;
        assert.notEqual(marketPlaceAddress, undefined, "Failed to deploy RegistryContract");
    });

    /**
     * TESTING DEPLOYMENT OF SafeMath library and Token contract
     *  */    
    it("Deploy SafeMath library and Token contract", async () => {
        const safeMathContract = await SafeMath.new();
        await Token.link("SafeMath", safeMathContract.address); 
        const tokenContract = await Token.new(managerContract.address);
        tokenAddress = tokenContract.address;
    });

    it("Linking the contracts together", async () => {
        const tx = await managerContract.link(
            registryAddress,
            factoryAddress,
            marketPlaceAddress,
            tokenAddress
        );
        assert.equal(tx.receipt.status, true, "Link could not be created!");
    });

    it("Register producer, and check status", async () => {
        await managerContract.registerProducer(
            "Producer Name",
            "Producer information"
        );
        let status = await managerContract.getProducerInfo(accounts[0]);
        console.log(status);
        assert.equal(status[0], "", "Producer name is wrong!");
        assert.equal(status[1], "", "Producer information is wrong!");
        assert.equal(status[2], false, "Status should be false because we didn't send 5 ETH!!");
        assert.equal(status[3], false, "Status should be false because we didn't confirm the Producer!!");

        await managerContract.registerProducer(
            "Producer Name",
            "Producer information",
            {
                value: 5
            }
        );
        status = await managerContract.getProducerInfo(accounts[0]);
        console.log(status);
        assert.equal(status[0], "Producer Name", "Producer name is wrong!");
        assert.equal(status[1], "Producer information", "Producer information is wrong!");
        assert.equal(status[2], true, "Status should be true because we did send 5 ETH!!");
        assert.equal(status[3], false, "Status should be false because we didn't confirm the Producer!!");

        await managerContract.confirmProducer(accounts[0]);
        status = await managerContract.getProducerInfo(accounts[0]);
        assert.equal(status[2], true, "Status should be true because we did send 5 ETH!!");
        assert.equal(status[3], true, "Status should be true because we did confirm the Producer!!");
        await managerContract.registerProducer(
            "Producer 7",
            "Producer 7 information",
            {
                from: accounts[7],
                value: 5
            }
        );
        await managerContract.confirmProducer(accounts[7]);
        status = await managerContract.getProducerInfo(accounts[7]);
        assert.equal(status[0], "Producer 7", "Producer name is wrong!");
        assert.equal(status[1], "Producer 7 information", "Producer information is wrong!");
        assert.equal(status[2], true, "Status should be true because we did send 5 ETH!!");
        assert.equal(status[3], true, "Status should be true because we did confirm the Producer!!");

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
            const expiration2 = result_comp2[3];
            const price2 = result_comp2[4];
            const state2 = result_comp2[5];
            const otherInformation2 = result_comp2[6];
            const parentComponentAddress2 = result_comp2[7];
            const childComponentList2 = result_comp2[8];

            const result_comp3 = values[1]; 
            const owner3 = result_comp3[0];
            const componentName3 = result_comp3[1];
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
            const componentName3 = result_comp3[1];
            const expiration3 = result_comp3[3];
            const price3 = result_comp3[4];
            const state3 = result_comp3[5];
            const otherInformation3 = result_comp3[6];
            const parentComponentAddress3 = result_comp3[7];
            const childComponentList3 = result_comp3[8];

            assert.equal(componentName3, "Component3", "Component name was tampered!!"); 
            assert.equal(expiration3.toNumber(), 400, "Component expiration was tampered!!"); 
            assert.equal(price3.toNumber(), 4000, "Component price was tampered!!"); 
            assert.equal(state3.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation3, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(childComponentList3.length, 0, "Wrong number of child components!!"); 

            return Component.at(parentComponentAddress3);
        }).then(componentContract => {
            return componentContract.getData();
        }).then((result_comp1) => {
            const componentName1 = result_comp1[1];
            const expiration1 = result_comp1[3];
            const price1 = result_comp1[4];
            const state1 = result_comp1[5];
            const otherInformation1 = result_comp1[6];
            const parentComponentAddress1 = result_comp1[7];
            const childComponentList1 = result_comp1[8];

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

            const componentName0 = componentData[1];
            const expiration0 = componentData[3];
            const price0 = componentData[4];
            const state0 = componentData[5];
            const otherInformation0 = componentData[6];
            const parentComponentAddress0 = componentData[7];
            const childComponentList0 = componentData[8];

            assert.equal(parentComponentAddress0, "0x0000000000000000000000000000000000000000", "Data was tampered");
            assert.equal(componentName0, "Component0", "Component name was tampered!!"); 
            assert.equal(expiration0.toNumber(), 100, "Component expiration was tampered!!"); 
            assert.equal(price0.toNumber(), 1000, "Component price was tampered!!"); 
            assert.equal(state0.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation0, "Some information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(childComponentList0.length, 2, "Wrong number of child components!!"); 

            return Component.at(component2Address); 
        }).then(componentContract => {
            return componentContract.getData();
        }).then(result_comp2 => {
            const componentName2 = result_comp2[1];
            const expiration2 = result_comp2[3];
            const price2 = result_comp2[4];
            const state2 = result_comp2[5];
            const otherInformation2 = result_comp2[6];
            const parentComponentAddress2 = result_comp2[7];
            const childComponentList2 = result_comp2[8];

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

    it("Remove child component 1 from component 0", () => {
        return managerContract.getRegistredComponents().then((values) => {
            parentAddress = values[0];
            return managerContract.removeChildComponentFromComponent(parentAddress, values[1]);
        }).then(() => {
            return managerContract.getRegistredComponents();
        }).then((values) => {
            return Promise.all(
                [
                    managerContract.getComponentOwner(values[0]),
                    managerContract.getComponentOwner(values[1]),
                    managerContract.getComponentOwner(values[2]),
                    managerContract.getComponentOwner(values[3]),
                    Component.at(values[1])
                ]
            );
        }).then((values) => {
            // thw owner address should not be changed
            assert.equal(values[0], accounts[0], "Ownership is broken!"); 
            assert.equal(values[1], accounts[0], "Ownership is broken!"); 
            assert.equal(values[2], accounts[0], "Ownership is broken!"); 
            assert.equal(values[3], accounts[0], "Ownership is broken!"); 

            // values[4] is the Component1 contract 
            return values[4].getParentComponentAddress();
        }).then((parentAddress) => {
            assert.equal(parentAddress, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
        });
    });
    
    it("Flag component as broken", () => {
        return managerContract.createComponent(
            "Component5",
            500,
            5000,
            "Component that will be broken"
        ).then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getRegistrySize();
        }).then((databaseSize) => {
            assert.equal(databaseSize.toNumber(), 5, "Creation of the Component5 failed!"); 
            return managerContract.getRegistredComponents();
        }).then(values => {
            const componentAddress = values[4];
            return Component.at(componentAddress);
        }).then( async (component) => {
            const data = await component.getData();
            return [component.address, data];
        }).then(async result => {
            const [componentAddress, values] = result;
            const state = values[5];
            assert.equal(state.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            const component = await Component.at(componentAddress);
            const resultFlagBroken = await managerContract.flagComponentAsBroken(componentAddress);
            const afterChangeValues = await component.getData();
            assert.equal(afterChangeValues[5].toNumber(), 3, "Component state should be broken!!"); 
        });
    });

    it("Flag component as expired", () => {
        return managerContract.createComponent(
            "Component6",
            0,
            6000,
            "Component that will be flagedAsExpired"
        ).then(() => {
            //check if componentRegistred has the rigth number of components
            return managerContract.getRegistrySize();
        }).then((databaseSize) => {
            assert.equal(databaseSize.toNumber(), 6, "Creation of the Component6 failed!"); 
            return managerContract.getRegistredComponents();
        }).then(values => {
            const componentAddress = values[5];
            return Component.at(componentAddress);
        }).then( async (component) => {
            const data = await component.getData();
            return [component.address, data];
        }).then(async result => {
            const [componentAddress, values] = result;
            const state = values[5];
            assert.equal(state.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            const component = await Component.at(componentAddress);
            let managerResponse = await managerContract.flagComponentAsExpired(componentAddress);
            await mineTx(managerResponse);
            const afterChangeValues = await component.getData();
            assert.equal(afterChangeValues[5].toNumber(), 4, "Component state should be NeedsRecycled!!"); 
        });
    });

    it("Repair broken component", async () => {
        const components = await managerContract.getRegistredComponents();
        const c = await Component.at(components[4]);
        const stateBeforeRepair = await c.getData();
        assert.equal(stateBeforeRepair[5].toNumber(), 3, "Component state should be broken!!"); 
        let tx = await managerContract.repair(components[4]);
        await mineTx(tx);
        const stateAfterRepair = await c.getData();
        assert.equal(stateAfterRepair[5].toNumber(), 2, "Component state should be owned!!"); 
    });

    it("Destroy component", async () => {
        await managerContract.createComponent(
            "Testing destroy component",
            0,
            1000,
            "Component that will be destroyed"
        );
        const components = await managerContract.getRegistredComponents();
        const c = await Component.at(components[components.length-1]);
        const stateBeforeDestory= await c.getData();
        assert.equal(stateBeforeDestory[5].toNumber(), 0, "Component state editable!!"); 
        let tx = await managerContract.flagComponentAsExpired(components[components.length-1]);
        await mineTx(tx);
        tx = await managerContract.destroy(components[components.length-1]);
        await mineTx(tx);
        const stateAfterDestroy = await c.getData();
        assert.equal(stateAfterDestroy[5].toNumber(), 6, "Component state should be destroyed!!"); 
    });

    it("Recycle component", async () => {
        await managerContract.createComponent(
            "Testing destroy component",
            0,
            1000,
            "Component that will be recycled"
        );
        const components = await managerContract.getRegistredComponents();
        const c = await Component.at(components[components.length-1]);
        const stateBeforeRecycle = await c.getData();
        assert.equal(stateBeforeRecycle[5].toNumber(), 0, "Component state editable!!"); 
        let tx = await managerContract.flagComponentAsExpired(components[components.length-1]);
        await mineTx(tx);
        tx = await managerContract.recycle(components[components.length-1]);
        await mineTx(tx);
        const stateAfterRecycle = await c.getData();
        assert.equal(stateAfterRecycle[5].toNumber(), 5, "Component state should be recycled!!"); 
    });

    it("Test deposit and withdraw", async () => {
        await managerContract.deposit({from: owner, value: 10});
        await managerContract.deposit({from: alice, value: 30});

        let aliceBalance = await managerContract.balance({from: alice});
        let ownerBalance = await managerContract.balance({from: owner});

        assert.equal(ownerBalance.toNumber(), 10, "Balance should be 10 WETH"); 
        assert.equal(aliceBalance.toNumber(), 30, "Balance should be 30 WETH"); 

        await managerContract.withdraw(15, {from: alice});

        aliceBalance = await managerContract.balance({from: alice});
        ownerBalance = await managerContract.balance({from: owner});

        assert.equal(ownerBalance.toNumber(), 10, "Balance should be 10 WETH"); 
        assert.equal(aliceBalance.toNumber(), 15, "Balance should be 15 WETH"); 

        await managerContract.withdraw(15, {from: alice});
        await managerContract.withdraw(10, {from: owner});

        aliceBalance = await managerContract.balance({from: alice});
        ownerBalance = await managerContract.balance({from: owner});

        assert.equal(ownerBalance.toNumber(), 0, "Balance should be 0 WETH"); 
        assert.equal(aliceBalance.toNumber(), 0, "Balance should be 0 WETH"); 
    });

    it("Test allowance functions", async () => {
        const a1 = await managerContract.getAllowance(accounts[1]);
        assert.equal(a1.toNumber(), 0, "Allowance should be 0"); 
        await managerContract.modifyAllowance(accounts[1], 100);
        const a2 = await managerContract.getAllowance(accounts[1]);
        assert.equal(a2.toNumber(), 100, "Allowance should be 100"); 
        await managerContract.modifyAllowance(accounts[1], 0);
        const a3 = await managerContract.getAllowance(accounts[1]);
        assert.equal(a3.toNumber(), 0, "Allowance should be 0"); 
    });

    it("Test submitComponentToMarket", async () => {
        await managerContract.createComponent(
            "Test Component",
            100,
            1000,
            "Component that will be sent to market"
        );
        const components = await managerContract.getRegistredComponents();
        const c = await Component.at(components[components.length-1]);
        const stateBeforeSubmited = await c.getData();
        const componentsSubmitedForSale1 = await managerContract.getComponentsSubmitedForSale();
        assert.equal(stateBeforeSubmited[5].toNumber(), 0, "Component state should be Editable!"); 
        assert.equal(componentsSubmitedForSale1.length, 0, "There should be no component submited for sale!"); 

        await managerContract.submitComponentToMarket(components[components.length-1]); 
        const stateAfterSubmited = await c.getData();
        assert.equal(stateAfterSubmited[5].toNumber(), 1, "Component state should be SubmitedForSale!"); 
        const componentsSubmitedForSale2 = await managerContract.getComponentsSubmitedForSale();
        assert.equal(componentsSubmitedForSale2.length, 1, "There should be exactly one component submited for sale!"); 
    });

    it("Test addOffer and remove offer", async () => {
        const components = await managerContract.getComponentsSubmitedForSale();
        const componentAddress = components[0];

        await managerContract.addOffer(componentAddress, 100, {from: alice});
        let offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 1, "There should only be one offer!"); 

        const offer = await managerContract.getComponentOfferByIndex(componentAddress, 0);
        assert.equal(offer[0].toNumber(), 100, "Value should be equal to 100!"); 
        assert.equal(offer[1], alice, "Alice should be the sender!"); 

        await managerContract.addOffer(componentAddress, 100, {from: bob});
        offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 2, "There should only be two offers!"); 

        await managerContract.removeOffer(componentAddress, 0, {from: alice});
        offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 1, "There should only be one offer!"); 

        await managerContract.removeOffer(componentAddress, 0, {from: bob});
        offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 0, "There should no offer!"); 
    });

    it("Test acceptOffer", async () => {
        const components = await managerContract.getComponentsSubmitedForSale();
        const componentAddress = components[0];
        
        await managerContract.deposit({from: alice, value: 100});
        let aliceBalance = await managerContract.balance({from: alice});
        assert.equal(aliceBalance.toNumber(), 100, "Balance should be 100 WETH"); 

        await managerContract.addOffer(componentAddress, 100, {from: alice});
        let offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 1, "There should only be one offer!"); 

        const offer = await managerContract.getComponentOfferByIndex(componentAddress, 0);
        assert.equal(offer[0].toNumber(), 100, "Value should be equal to 100!"); 
        assert.equal(offer[1], alice, "Alice should be the sender!"); 

        await managerContract.acceptOffer(componentAddress, 0);
        offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 0, "There should be no offer!"); 

    });

    it("Test rejectOffer", async () => {
        await managerContract.createComponent(
            "Test Component",
            100,
            1000,
            "Component that will be removed from market"
        );
        let components = await managerContract.getRegistredComponents();
        const componentAddress = components[components.length-1];
        await managerContract.submitComponentToMarket(componentAddress); 

        components = await managerContract.getComponentsSubmitedForSale();

        await managerContract.deposit({from: alice, value: 100});
        await managerContract.deposit({from: bob, value: 110});
        let aliceBalance = await managerContract.balance({from: alice});
        let bobBalance = await managerContract.balance({from: bob});
        assert.equal(aliceBalance.toNumber(), 100, "Balance should be 100 WETH"); 
        assert.equal(bobBalance.toNumber(), 110, "Balance should be 110 WETH"); 

        await managerContract.addOffer(componentAddress, 100, {from: alice});
        await managerContract.addOffer(componentAddress, 110, {from: bob});
        let offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 2, "There should be two offers!"); 

        await managerContract.rejectOffer(componentAddress, 0);
        await managerContract.rejectOffer(componentAddress, 0);

        offerSize = await managerContract.getComponentOfferSize(componentAddress);
        assert.equal(offerSize.toNumber(), 0, "There should be no offer!"); 

        await managerContract.removeComponentFromMarket(componentAddress);
        components = await managerContract.getComponentsSubmitedForSale();

        assert.equal(components.length, 0, "There should be no component submited for sale!"); 
    });

    it("Test removeComponentFromMarket", async () => {
        await managerContract.createComponent(
            "Test Component",
            100,
            1000,
            "Component that will be removed from market"
        );
        let components = await managerContract.getRegistredComponents();
        await managerContract.submitComponentToMarket(components[components.length-1]); 

        components = await managerContract.getComponentsSubmitedForSale();
        const componentAddress = components[0];
        const component = await Component.at(componentAddress);
        const cData = await component.getData();
        assert.equal(cData[5].toNumber(), 1, "Component state should be SubmitedForSale!"); 

        await managerContract.removeComponentFromMarket(componentAddress);
        const submitedForSaleList = await managerContract.getComponentsSubmitedForSale();
        const componentData = await component.getData();

        assert.equal(submitedForSaleList.length, 0, "There should be no component submited for sale!"); 
        assert.equal(componentData[5].toNumber(), 2, "Component state should be Owned!"); 
    });

    it("Test reward mechanism in case component is being recycled", async () => {
        await managerContract.deposit({from: accounts[7], value: 1000});
        let a7_balance = await managerContract.balance({from: accounts[7]});
        let a8_balance = await managerContract.balance({from: accounts[8]});

        assert.equal(a7_balance.toNumber(), 1000, "Balance should be 1000"); 
        assert.equal(a8_balance.toNumber(), 0, "Balance should be 0"); 

        await managerContract.createComponent(
            "RewardComponent",
            0,
            100,
            "Component that will be recycled",
            {
                from: accounts[7],
                value: 100
            }
        );

        const components = await managerContract.getRegistredComponents();
        const componentAddress = components[components.length-1];
        const c = await Component.at(componentAddress);
        const data = await c.getData();
        assert.equal(data[5].toNumber(), 0, "Component state editable!!"); 

        const reward = await managerContract.getComponentReward(componentAddress);
        assert.equal(reward.toNumber(), 100, "Reward value should be 100!!"); 

        let tx = await managerContract.flagComponentAsExpired(
            componentAddress,
            {
                from: accounts[7]
            }
        );
        await mineTx(tx);
        tx = await managerContract.recycle(
            componentAddress,
            {
                from: accounts[8]
            }
        );
        await mineTx(tx);

        a7_balance = await managerContract.balance({from: accounts[7]});
        a8_balance = await managerContract.balance({from: accounts[8]});

        assert.equal(a8_balance.toNumber(), 75, "Balance should be 75"); 
        assert.equal(a7_balance.toNumber(), 1025, "Balance should be 1025"); 
    });

    it("Test reward mechanism in case component is being destroyed", async () => {
        let a7_balance = await managerContract.balance({from: accounts[7]});
        let a8_balance = await managerContract.balance({from: accounts[8]});
        assert.equal(a7_balance.toNumber(), 1025, "Balance should be 1025"); 
        assert.equal(a8_balance.toNumber(), 75, "Balance should be 25"); 

        await managerContract.createComponent(
            "RewardComponent",
            0,
            100,
            "Component that will be destroyed",
            {
                from: accounts[7],
                value: 100
            }
        );

        const components = await managerContract.getRegistredComponents();
        const componentAddress = components[components.length-1];
        const c = await Component.at(componentAddress);
        let data = await c.getData();
        assert.equal(data[5].toNumber(), 0, "Component state editable!!"); 

        const reward = await managerContract.getComponentReward(componentAddress);
        assert.equal(reward.toNumber(), 100, "Reward value should be 100!!"); 

        let tx = await managerContract.flagComponentAsExpired(
            componentAddress,
            {
                from: accounts[7]
            }
        );

        await mineTx(tx);
        tx = await managerContract.destroy(
            componentAddress,
            {
                from: accounts[8]
            }
        );
        await mineTx(tx);

        a7_balance = await managerContract.balance({from: accounts[7]});
        a8_balance = await managerContract.balance({from: accounts[8]});

        assert.equal(a8_balance.toNumber(), 75, "Balance should be 75"); 
        assert.equal(a7_balance.toNumber(), 1037, "Balance should be 1037"); 
    });

    it("Register recycler, and check status", async () => {
        await managerContract.registerRecycler(
            "Recycler name",
            "Information about the recycler",
            {
                from: accounts[9],
                value: 1
            }
        );
        let status = await managerContract.getRecyclerInfo(accounts[9]);
        assert.equal(status[0], "Recycler name", "Wrong recycler name!"); 
        assert.equal(status[1], "Information about the recycler", "Wrong recycler information!"); 
        assert.equal(status[2].toNumber(), 0, "Wrong recycled value!"); 
        assert.equal(status[3], true, "Recycler should be registred!"); 
        assert.equal(status[4], false, "Recycler should not be confirmed!"); 

        await managerContract.confirmRecycler(accounts[9]);

        status = await managerContract.getRecyclerInfo(accounts[9]);
        assert.equal(status[0], "Recycler name", "Wrong recycler name!"); 
        assert.equal(status[1], "Information about the recycler", "Wrong recycler information!"); 
        assert.equal(status[2].toNumber(), 0, "Wrong recycled value!"); 
        assert.equal(status[3], true, "Recycler should be registred!"); 
        assert.equal(status[4], true, "Recycler should be confirmed!"); 

    });
});
