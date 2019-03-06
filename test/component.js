const Component = artifacts.require("Component");



contract('Component - testing deployment and creation of Component contract', (accounts) => {

    let componentContract;

    /**
     * TESTING DEPLOYMENT OF Component CONTRACT
     *  */    
    it("Deploy Component contract and assert for the right values", () => {
        return Component.new("Component", accounts[0]).then((instance) => {
            componentContract = instance;
            assert.notEqual(componentContract, undefined, "Failed to deploy Component");
        }).then(() => {
            return Promise.all(
                [
                    componentContract.getData(),
                    componentContract.getParentComponentAddress(),
                    componentContract.getNumberOfChildComponents(),
                    componentContract.getChildComponentList(),
                    componentContract.owner()
                ]
            );
        }).then((values) => {
            const [
                data, 
                parentComponentAddress, 
                numberOfChildComponents, 
                childComponentList,
                owner
            ] = values;
            assert.equal(data, "Component", "Component data was tampered!!"); 
            assert.equal(parentComponentAddress, "0x0000000000000000000000000000000000000000", "Parent address is wrong!!"); 
            assert.equal(numberOfChildComponents.toNumber(), 0, "Wrong number child components!!"); 
            assert.equal(childComponentList, 0, "Wrong number of child components!!"); 
            assert.equal(owner, accounts[0], "Wrong number of child components!!"); 
        });
    });
});