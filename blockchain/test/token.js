const SafeMath = artifacts.require("SafeMath");
const Token = artifacts.require("Token");

contract('Token testing', (accounts) => {

    let tokenContract;

    it("Testing libray and token deployment", async () => {
        const safeMathContract = await SafeMath.new();
        await Token.link("SafeMath", safeMathContract.address); 
        const token = await Token.new(accounts[0]);
        tokenContract = token;
        assert.notEqual(token, undefined, "Failed to deploy Token contract!");
    });

    it("Testing token contract mint", async () => {
        await tokenContract.mint(accounts[0], 1234567);
        const totalSupply = await tokenContract.totalSupply();
        const balance = await tokenContract.balanceOf(accounts[0]);
        assert.equal(totalSupply.toNumber(), 1234567, "Mint failed!");
        assert.equal(balance.toNumber(), 1234567, "Mint failed!");
    });

    it("Testing token contract transfer", async () => {
        await tokenContract.mint(accounts[0], 1234567);
        const totalSupply = await tokenContract.totalSupply();
        const balance = [
            await tokenContract.balanceOf(accounts[0]),
            await tokenContract.balanceOf(accounts[1]),
        ];
        assert.equal(totalSupply.toNumber(), balance[0].toNumber(), "Mint failed!");
        assert.equal(0, balance[1].toNumber(), "Mint failed!");

        await tokenContract.transfer(accounts[0], accounts[1], 1234567);
        const balanceAfter = [
            await tokenContract.balanceOf(accounts[0]),
            await tokenContract.balanceOf(accounts[1]),
        ];
        const totalSupplyAfter = await tokenContract.totalSupply();
        assert.equal(balanceAfter[0].toNumber(), 1234567, "Transfer failed!");
        assert.equal(balanceAfter[1].toNumber(), 1234567, "Transfer failed!");
        assert.equal(totalSupplyAfter.toNumber(), totalSupply.toNumber(), "Transfer failed!");
    });

    it("Testing transferFrom", async () => {
        // allow accounts[0] to transfer 100 tokens from accounts[1] balance
        // to accounts[2]
        await tokenContract.approve(accounts[1], accounts[0], 100);
        const allowance = await tokenContract.allowance(accounts[1], accounts[0]);
        assert.equal(allowance.toNumber(), 100, "Approve Failed!");
        await tokenContract.transferFrom(accounts[0], accounts[1], accounts[2], 100);
        const totalSupply = await tokenContract.totalSupply();
        const balance = [
            await tokenContract.balanceOf(accounts[0]),
            await tokenContract.balanceOf(accounts[1]),
            await tokenContract.balanceOf(accounts[2]),
        ];
        assert.equal(totalSupply.toNumber(), 2469134, "Transfer failed!");
        assert.equal(balance[0].toNumber(), 1234567, "Transfer failed!");
        assert.equal(balance[1].toNumber(), 1234467, "Transfer failed!");
        assert.equal(balance[2].toNumber(), 100, "Transfer failed!");
    });

});
