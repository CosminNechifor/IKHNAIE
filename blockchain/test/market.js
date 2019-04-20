const MarketPlace = artifacts.require("MarketPlace");

contract('Market testing', (accounts) => {

    let marketContract;

    it("Testing deployment", async () => {
        marketContract = await MarketPlace.new(accounts[0]);
        assert.notEqual(marketContract, undefined, "Failed to deploy MarketPlace contract!");
    });

    // needs mode tests to be implemented
});
