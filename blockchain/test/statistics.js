const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");
const Component = artifacts.require("Component");
const Registry = artifacts.require("Registry");
const MarketPlace = artifacts.require("MarketPlace");
const SafeMath = artifacts.require("SafeMath");
const Token = artifacts.require("Token");
const fs = require('fs');

contract('Statistics', (accounts) => {
    
    const gas_price_wei = 20000000000;
    const wei_to_ether = Math.pow(10, 18);

    let managerContract;
    let factoryAddress;
    let registryAddress;
    let marketPlaceAddress;
    let tokenAddress;

    function get_gas_used(contractName, initial, after) {
        const gas_used = (-1) * (after - initial) / gas_price_wei;
        const ether = (initial - after) / wei_to_ether;
        const result = `${contractName},${gas_used},${ether}\n`;
        fs.appendFile("statistics.csv", result, (err) => {
            if (err)
                return console.log(`Failed to write ${contractName} contract statistics: ${err}`);
            console.log(`${contractName} write was successfully executed.`);
        });
    }

    function write_statistics_for_function(func_name, receipt){
        const gas_used = receipt.receipt.gasUsed;
        const used_ether = (gas_used * gas_price_wei) / wei_to_ether;
        const to_write = `${func_name},${gas_used},${used_ether}\n`;

        fs.appendFile("statistics.csv", to_write, (err) => {
            if (err)
                return console.log(`Failed to write ${func_name} statistics: ${err}`);
            console.log(`${func_name} write was successfully executed.`);
        });
    
    }

    it("Write CSV header", () => {
        const header = "Deployment and link\nContract name,Gas Used,Eth used\n"
        fs.writeFile("statistics.csv", header, (err) => {
            if(err) {
                return console.log(err);
            }
            console.log("Header write was successfully executed.");
        }); 
    });

    it("Deploy ManagerContract contract", async () => {
        const initial = await web3.eth.getBalance(accounts[0]);
        managerContract = await Manager.new();
        const after = await web3.eth.getBalance(accounts[0]);
        
        get_gas_used("ManagerContract", initial, after);

        assert.notEqual(managerContract.address, undefined, "Failed to deploy Manager contract");
    });

    it("Deploy ComponentFactory contract", async () => {
        const initial = await web3.eth.getBalance(accounts[0]);
        const instance = await ComponentFactory.new(managerContract.address);
        const after = await web3.eth.getBalance(accounts[0]);
        
        get_gas_used("ComponentFactory", initial, after);

        factoryAddress = instance.address;
        assert.notEqual(factoryAddress, undefined, "Failed to deploy Factory contract");
    });

    it("Deploy Registry contract", async () => {
        const initial = await web3.eth.getBalance(accounts[0]);
        const instance = await Registry.new(managerContract.address);
        const after = await web3.eth.getBalance(accounts[0]);

        get_gas_used("Registry", initial, after);

        registryAddress = instance.address;
        assert.notEqual(registryAddress, undefined, "Failed to deploy Registry contract");
    });

    it("Deploy MarketPlace contract", async () => {
        const initial = await web3.eth.getBalance(accounts[0]);
        const instance = await MarketPlace.new(managerContract.address);
        const after = await web3.eth.getBalance(accounts[0]);

        get_gas_used("MarketPlace", initial, after);

        marketPlaceAddress = instance.address;
        assert.notEqual(marketPlaceAddress, undefined, "Failed to deploy MarketPlace contract");
    });

    it("Deploy SafeMath library and Token contract", async () => {
        let initial = await web3.eth.getBalance(accounts[0]);
        const safeMathContract = await SafeMath.new();
        let after = await web3.eth.getBalance(accounts[0]);

        get_gas_used("SafeMath", initial, after);

        await Token.link("SafeMath", safeMathContract.address); 

        initial = await web3.eth.getBalance(accounts[0]);
        const tokenContract = await Token.new(managerContract.address);
        after = await web3.eth.getBalance(accounts[0]);

        get_gas_used("Token", initial, after);

        tokenAddress = tokenContract.address;
    });

    
    it("Linking the contracts together", async () => {
        const receipt = await managerContract.link(
            registryAddress,
            factoryAddress,
            marketPlaceAddress,
            tokenAddress
        );
        await fs.appendFile("statistics.csv", "\nOperation,Gas Used,Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
            console.log("Writing functions results.");
        });
        write_statistics_for_function("Link function", receipt);
        assert.equal(receipt.receipt.status, true, "Link could not be created!");
    });

    it("Each actor will mint 1 000 000 tokens and will withdraw 50", async () => {
        await fs.appendFile("statistics.csv", "\nEach account mints 1 000 000 tokens and withdraws 50\nOperation,Gas Used, Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
        });
        
        // will not execute them in parallel because of the file lock
        let receipt;
        for (i = 0; i < 10; i++) {
            receipt = await managerContract.deposit({from: accounts[i], value: 1000000});
            write_statistics_for_function(`Account[${i}] deposit`, receipt);
        }
        for (i = 0; i < 10; i++) {
            receipt = await managerContract.withdraw(50, {from: accounts[i]});
            write_statistics_for_function(`Account[${i}] withdraw`, receipt);
        }

        let balance;
        for (i = 0; i < 10; i++) {
            balance = await managerContract.balance({from: accounts[i]});
            assert.equal(balance.toNumber(), 999950, "Balance should be WETH"); 
        }
    });

    // We will 5 producers and 5 recyclers 
    it("Register producers and confirm them", async () => {
        await fs.appendFile("statistics.csv", "\nFirst 5 accounts will register as producers.\nOperation,Gas Used, Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
        });

        let receipt;
        for (i = 0; i < 5; i++) {
            receipt = await managerContract.registerProducer(
                `Account[${i}] producer`,
                'info',
                {
                    from: accounts[i],
                    value: 5
                }
            );
            write_statistics_for_function(`Account[${i}] registers as Producer`, receipt);
        }

        for (i = 0; i < 5; i++) {
            receipt = await managerContract.confirmProducer(accounts[i]);
            write_statistics_for_function(`Account[${i}] confirmed as Producer`, receipt);
        }
    });

    it("Register recyclers and confirm them", async () => {
        await fs.appendFile("statistics.csv", "\nLast 5 accounts will register as recyclers.\nOperation,Gas Used, Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
        });

        let receipt;
        for (i = 0; i < 5; i++) {
            receipt = await managerContract.registerRecycler(
                `Account[${i}] recycler`,
                'info',
                {
                    from: accounts[i],
                    value: 1 
                }
            );
            write_statistics_for_function(`Account[${i}] registers as Recycler`, receipt);
        }

        for (i = 0; i < 5; i++) {
            receipt = await managerContract.confirmRecycler(accounts[i]);
            write_statistics_for_function(`Account[${i}] confirmed as Recycler`, receipt);
        }
    });

    it("Creation of simple component", async () => {
        await fs.appendFile("statistics.csv", "\nCreation of 20 simple components.\nOperation,Gas Used, Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
        });
        let receipt;
        for (i = 0; i < 25; i++) {
            receipt = await managerContract.createComponent(
                "Simple Root Component",
                200,
                20000,
                "info",
                {
                    from: accounts[0],
                    value: 100
                }
            );
            write_statistics_for_function(`Producer[0] creates component[${i}]`, receipt);
        } 
    });

    it("Creation of complex components", async () => {
        await fs.appendFile("statistics.csv", "\nCreation of complex components.\nOperation,Gas Used, Ether Used\n", (err) => { 
            if (err) 
                console.log(err); 
        });
        let receipt = await managerContract.createComponent(
            "Component",
            2000,
            20000,
            "info",
            {
                from: accounts[0],
                value: 100
            }
        );
        write_statistics_for_function(`Producer[0] creates Root Component`, receipt);
        
        let componentsList = await managerContract.getRegistredComponents();
        const rootComponent = componentsList[componentsList.length-1];
        let lastComponentCreated;

        for (i = 0; i < 10; i++) {
            receipt = await managerContract.createComponent(
                "Component",
                2000,
                20000,
                "info",
                {
                    from: accounts[0],
                    value: 100
                }
            );
            write_statistics_for_function(`Producer[0] creates component`, receipt);
            
            componentsList = await managerContract.getRegistredComponents();
            lastComponentCreated = componentsList[componentsList.length-1];
            
            receipt = await managerContract.addChildComponentToComponent(
                rootComponent,
                lastComponentCreated
            );
            write_statistics_for_function(`Producer[0] adds the created component to the root component`, receipt);
        } 
        
        const leafComponent = lastComponentCreated;
        for (i = 0; i < 5; i++) {
            receipt = await managerContract.createComponent(
                "Component",
                2000,
                20000,
                "info",
                {
                    from: accounts[0],
                    value: 100
                }
            );
            write_statistics_for_function(`Producer[0] creates component`, receipt);

            componentsList = await managerContract.getRegistredComponents();
            lastComponentCreated = componentsList[componentsList.length-1];
            
            receipt = await managerContract.addChildComponentToComponent(
                leafComponent,
                lastComponentCreated 
            );
            write_statistics_for_function(`Producer[0] adds the created component to a leaf component`, receipt);

        }

        receipt = await managerContract.updateComponentName(rootComponent, "Root Component");
        write_statistics_for_function(`Producer[0] updates the root component name.`, receipt);

        receipt = await managerContract.updateComponentExpiration(rootComponent, 2000000);
        write_statistics_for_function(`Producer[0] updates the root component expiration time.`, receipt);

        receipt = await managerContract.updateComponentOtherInformation(rootComponent, "new other information");
        write_statistics_for_function(`Producer[0] updates the root component other information field.`, receipt);

        receipt = await managerContract.updateComponentPrice(rootComponent, 320000);
        write_statistics_for_function(`Producer[0] updates the root component price.`, receipt);


        receipt = await managerContract.submitComponentToMarket(rootComponent);
        write_statistics_for_function(`Producer[0] sends the root component to market`, receipt);

        // place 9 offers in the market 
        for (i = 1; i < 10; i++) {
            receipt = await managerContract.addOffer(
                rootComponent, 
                40000, 
                {
                    from: accounts[i]
                }
            );
            write_statistics_for_function(`Account[${i}] adds offer of 40000 tokens for the component`, receipt);
        }

        // accounts[1] removes it's offer 
        receipt = await managerContract.removeOffer(
            rootComponent, 
            0, 
            {
                from: accounts[1]
            }
        );
        write_statistics_for_function(`Account[${i}] removes it's offer for the component`, receipt);

        // Component Owner removes next 2 offers
        for (i = 0; i < 4; i++) {
            receipt = await managerContract.rejectOffer(
                rootComponent, 
                0
            );
            write_statistics_for_function(`Owner rejects 2 offersfor the component`, receipt);
        }

        // Owner accepts offer
        receipt = await managerContract.acceptOffer(
            rootComponent,
            0
        );
        write_statistics_for_function(`Owner accepts offer for the component`, receipt);
        
        
        // showing balances to make sure it worked properly
        // accounts[5] should be the owner
        for (i = 0; i < 10; i++) {
            receipt = await managerContract.balance({from: accounts[i]});
            console.log(`Accounts[${i}]:${receipt.toNumber()}`);
        }

        receipt = await managerContract.updateComponentPrice(
            rootComponent, 
            45000,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) updates the price as he wants`, receipt);

        receipt = await managerContract.submitComponentToMarket(
            rootComponent,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) decides to sell the component`, receipt);
        
        receipt = await managerContract.removeComponentFromMarket(
            rootComponent,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) decides to remove the component from market`, receipt);

        
        receipt = await managerContract.getChildComponentListOfAddress(rootComponent);
        let newRootComponent = receipt[4];

        receipt = await managerContract.removeChildComponentFromComponent(
            rootComponent, 
            newRootComponent,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) decides to remove a child component from root component`, receipt);

        receipt = await managerContract.flagComponentAsBroken(
            newRootComponent,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) decides to flag new root component.`, receipt);

        //submit for recycling
        receipt = await managerContract.submitForRecycling(
            newRootComponent,
            {
                from: accounts[5]
            }
        );
        write_statistics_for_function(`New Owner (Accounts[5]) decides to submit the new root component for recycling.`, receipt);

         
        receipt = await managerContract.getComponentData(newRootComponent);
        assert.equal(receipt[5].toNumber(), 4, "Component should be in NeedsRecycled state");
        
        // a recycler recycles the component
        receipt = await managerContract.recycle(
            newRootComponent,
            {
                from: accounts[3]
            }
        );
        write_statistics_for_function(`Accounts[3] decides to recycle the submitted component.`, receipt);

        receipt = await managerContract.getComponentData(newRootComponent);
        assert.equal(receipt[5].toNumber(), 5, "Component should be in NeedsRecycled state");

        // visualize the balances
        for (i = 0; i < 10; i++) {
            receipt = await managerContract.balance({from: accounts[i]});
            console.log(`Accounts[${i}]:${receipt.toNumber()}`);
        }
    });

});
