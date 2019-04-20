const MarketPlace = artifacts.require("MarketPlace");

const truffleAssert = require('truffle-assertions');

contract('Market testing', (accounts) => {

    let marketContract;

    // Since the contract is not concerned with verifing if
    // an address is a contract or an user I will be using the account as contracts
    const components = [...accounts.slice(2)];

    it("Testing deployment", async () => {
        marketContract = await MarketPlace.new(accounts[0]);
        assert.notEqual(marketContract, undefined, "Failed to deploy MarketPlace contract!");
    });

    it("Testing submitForSale logic", async () => {
        await marketContract.submitForSale(accounts[0], components[0]);
        await marketContract.submitForSale(accounts[0], components[1]);
        const compSFS = await marketContract.getComponentsSubmitedForSale();
        assert.equal(compSFS.length, 2, "Submited for sale failed!");
        assert.equal(compSFS[0], components[0], "Submited for sale failed!");
        assert.equal(compSFS[1], components[1], "Submited for sale failed!");
    });

    it("Testing removeFromSale logic", async () => {
        // remove the first component and expect the following:
        // the component which was index 1 before is now index 1
        const compSFS = await marketContract.getComponentsSubmitedForSale();
        await marketContract.removeFromSale(accounts[0], compSFS[0]);
        const component1 = await marketContract.getComponentsSubmitedForSale();
        assert.equal(component1[0], components[1], "RemoveFromSale failed!");

        // remove the only component left
        await marketContract.removeFromSale(accounts[0], compSFS[1]);
        const shouldBeEmptyList = await marketContract.getComponentsSubmitedForSale();
        assert.equal(shouldBeEmptyList.length, 0, "RemoveFromSale failed!");
    });

    it("Testing addOffer and getComponentOfferSize logic", async () => {
        await marketContract.submitForSale(accounts[0], components[0]);
        await marketContract.submitForSale(accounts[0], components[1]);

        const comps = await marketContract.getComponentsSubmitedForSale();
        assert.equal(comps.length, 2, "Submited for sale failed!");

        await marketContract.addOffer(accounts[1], comps[0], 10);
        await marketContract.addOffer(accounts[1], comps[0], 20);
        await marketContract.addOffer(accounts[1], comps[0], 30);
        await marketContract.addOffer(accounts[1], comps[1], 10);
        await marketContract.addOffer(accounts[1], comps[1], 20);

        const component0OfferSize = await marketContract.getComponentOfferSize(components[0]);
        const component1OfferSize = await marketContract.getComponentOfferSize(components[1]);

        assert.equal(component0OfferSize.toNumber(), 3, "Add offer failed");
        assert.equal(component1OfferSize.toNumber(), 2, "Add offer failed");
    });

    it("Testing getOfferByIndex logic", async () => {
        const c1o1 = await marketContract.getComponentOfferByIndex(components[0], 0);
        const c1o2 = await marketContract.getComponentOfferByIndex(components[0], 1);
        const c1o3 = await marketContract.getComponentOfferByIndex(components[0], 2);

        const c2o1 = await marketContract.getComponentOfferByIndex(components[1], 0);
        const c2o2 = await marketContract.getComponentOfferByIndex(components[1], 1);

        const component1Offers = [c1o1[0].toNumber(), c1o2[0].toNumber(), c1o3[0].toNumber()];
        const component2Offers = [c2o1[0].toNumber(), c2o2[0].toNumber()];

        assert(component1Offers.includes(10), "Add offer failed");
        assert(component1Offers.includes(20), "Add offer failed");
        assert(component1Offers.includes(30), "Add offer failed");
        assert(component2Offers.includes(10), "Add offer failed");
        assert(component2Offers.includes(20), "Add offer failed");
    });

    it("Testing acceptOffer logic", async () => {
        const acceptedOffer = await marketContract.acceptOffer(
            accounts[0],
            components[0],
            1
        );

        truffleAssert.eventNotEmitted(acceptedOffer, 'OfferAccepted', (ev) => {});
        const comps = await marketContract.getComponentsSubmitedForSale();
        assert.equal(comps.length, 1, "Accept offer worked!");
    });

    // it("Testing rejectOffer logic", async () => {
    //     const acceptedOffer = await marketContract.rejectOffer(
    //         components[1],
    //         1
    //     );

    //     truffleAssert.eventNotEmitted(acceptedOffer, 'OfferRejected', (ev) => {console.log(ev)});
    //     const comps = await marketContract.getComponentsSubmitedForSale();
    //     assert.equal(comps.length, 2, "Accept offer worked!");

    //     //assert for only one offer
    //     const componentOffersSize = await marketContract.getComponentOfferSize(components[1]);
    //     assert.equal(componentOffersSize.length, 1, "Reject offer worked!");
    // });
});
