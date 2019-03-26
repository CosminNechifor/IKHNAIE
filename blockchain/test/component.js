const Component = artifacts.require("Component");



contract('Component - testing happy cases', (accounts) => {

    let componentContract;

    /**
     * TESTING DEPLOYMENT OF Component CONTRACT
     *  */    
    it("Deploy Component contract and assert for the right values", () => {
        return Component.new(
            accounts[0],
            "ComponentName",
            120,
            20000,
            "other information"
        ).then((instance) => {
            componentContract = instance;
            assert.notEqual(componentContract, undefined, "Failed to deploy Component");
        }).then(() => {
            return Promise.all(
                [
                    componentContract.getData(),
                    componentContract.getNumberOfChildComponents()
                ]
            );
        }).then((values) => {
            const result = values[0]; 
            const owner = result[0];
            const componentName = result[1];
            const creationgTime = result[2];
            const expiration = result[3];
            const price = result[4];
            const state = result[5];
            const otherInformation = result[6];
            const parentComponentAddress = result[7];
            const childComponentList = result[8];
            const numberOfChildComponents = values[1]; 

            assert.equal(owner, accounts[0], "Wrong number of child components!!"); 
            assert.equal(componentName, "ComponentName", "Component name was tampered!!"); 
            assert.equal(expiration.toNumber(), 120, "Component expiration was tampered!!"); 
            assert.equal(price.toNumber(), 20000, "Component price was tampered!!"); 
            assert.equal(state.toNumber(), 0, "Component state wasn't corectly initialized!!"); 
            assert.equal(otherInformation, "other information", "Component otherInformation wasn't corectly initialized!!"); 
            assert.equal(parentComponentAddress, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(numberOfChildComponents.toNumber(), 0, "Wrong number child components!!"); 
            assert.equal(childComponentList, 0, "Wrong number of child components!!"); 
        });
    });
    
    it("Test updateParentAddress", () => {
        return componentContract.getParentComponentAddress().then(parentComponentAddress => {
            assert.equal(parentComponentAddress, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            return componentContract.updateParentAddress("0x1f81A518F69b6AAF5f54A583F44d9b1A95081A6f");
        }).then(() => {
            return componentContract.getParentComponentAddress();
        }).then(parentComponentAddress  => {
            assert.equal(parentComponentAddress, "0x1f81A518F69b6AAF5f54A583F44d9b1A95081A6f", "Parent address is wrong!!"); 
        });
    });

    it("Test updateComponentName", () => {
        return componentContract.getData().then(values => {
            assert.equal(values[1], "ComponentName", "ComponentName is wrong!!"); 
            return componentContract.updateComponentName("NewComponentName");
        }).then(() => {
            return componentContract.getData();
        }).then(values => {
            assert.equal(values[1], "NewComponentName", "ComponentName is wrong!!"); 
        });
    });

    it("Test updateComponentExpiration", () => {
        return componentContract.getData().then(values => {
            assert.equal(values[3].toNumber(), 120, "Component expiration was tampered!!"); 
            return componentContract.updateComponentExpiration(60);
        }).then(() => {
            return componentContract.getData();
        }).then(values => {
            assert.equal(values[3].toNumber(), 60, "Expiration is wrong!"); 
        });
    });

    it("Test updateComponentPrice", () => {
        return componentContract.getData().then(values => {
            assert.equal(values[4].toNumber(), 20000, "Component price was tampered!!"); 
            return componentContract.updateComponentPrice(10000);
        }).then(() => {
            return componentContract.getData();
        }).then(values => {
            assert.equal(values[4].toNumber(), 10000, "Price is wrong!"); 
        });
    });

});
