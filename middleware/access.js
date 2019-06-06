import Web3 from 'web3';
import * as fs from 'fs';

const managerContractPath = '../blockchain/build/contracts/Manager.json';
const componentContractPath = '../blockchain/build/contracts/Component.json';
const managerContractAddress = '0xad934659b1e341dE46442E77437655B51aDe3dB3';
const privKey = '0x876258c7c6c0eecff9c179a76b2f002bc9a35cde23ff4fbc7df17f8f683e1614';

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8540");

const getContractJSON = (filepath) => {
    const rawdata = fs.readFileSync('../blockchain/build/contracts/Manager.json');  
    return JSON.parse(rawdata);  
}

const createContractInterface = (json, contractAddress) => {
    return web3.eth.Contract(
        json.abi,
        contractAddress
    );
}

const ManagerContract = createContractInterface(getContractJSON(managerContractPath), managerContractAddress);
const account = web3.eth.accounts.privateKeyToAccount(privKey);

// needs to be tested and we need to add
// an endpoint for it
const deposit = (data) => {
    return ManagerContract.methods
        .deposit(data)
        .send({from: account.address, gas: 3900000, value:data.value});
} 

// needs to be tested and we need to add
// an endpoint for it
const withdraw = (data) => {
    return ManagerContract.methods
        .withdraw(data)
        .send({from: account.address, gas: 3900000});
} 

// needs to be tested and we need to add
// an endpoint for it
const registerActor = (data, type) => {
    
    // check type before calling register
    if (type === "Repairer")
        return ManagerContract.methods
            .registerRepairer(data)
            .send({from: account.address, gas: 3900000});
    if (type === "Recycler")
        return ManagerContract.methods
            .registerRecycler(data)
            .send({from: account.address, gas: 3900000});
    if (type === "Producer")
        return ManagerContract.methods
            .registerProducer(data)
            .send({from: account.address, gas: 3900000});
} 

const confirmActor = (data, type) => {
    if (type === "Repairer")
        return ManagerContract.methods
            .confirmRepairer(data)
            .send({from: account.address, gas: 3900000});
    if (type === "Recycler")
        return ManagerContract.methods
            .confirmRecycler(data)
            .send({from: account.address, gas: 3900000});
    if (type === "Producer")
        return ManagerContract.methods
            .confirmProducer(data)
            .send({from: account.address, gas: 3900000});
}

const createComponent = (data, amount) => {
    return ManagerContract.methods
        .createComponent(data)
        .send({from: account.address, gas: 3900000, value: amount});
} 

const addChildComponentToComponent = (parentAddress, childAddress) => {
    return ManagerContract.methods
        .addChildComponentToComponent(parentAddress, childAddress)
        .send({from: account.address, gas: 4000000});
}

const removeChildComponentFromComponent = (parentAddress, id) => {
    return ManagerContract.methods
        .removeChildComponentFromComponent(parentAddress, id)
        .send({from: account.address, gas: 4000000});
} 

const submitComponentToMarket = (data) => {
    return ManagerContract.methods
        .submitComponentToMarket(data)
        .send({from: account.address, gas: 4000000});
} 

const removeComponentFromMarket = (data) => {
    return ManagerContract.methods
        .removeComponentFromMarket(data)
        .send({from: account.address, gas: 4000000});
} 

const addOffer = (data) => {
    return ManagerContract.methods
        .addOffer(data)
        .send({from: account.address, gas: 4000000});
} 

const removeOffer = (data) => {
    return ManagerContract.methods
        .removeOffer(data)
        .send({from: account.address, gas: 4000000});
} 

const acceptOffer = (data) => {
    return ManagerContract.methods
        .acceptOffer(data)
        .send({from: account.address, gas: 4000000});
} 

const rejectOffer = (data) => {
    return ManagerContract.methods
        .rejectOffer(data)
        .send({from: account.address, gas: 4000000});
} 

const modifyAllowance = (data) => {
    return ManagerContract.methods
        .modifyAllowance(data)
        .send({from: account.address, gas: 4000000});
} 

const flagComponentAsExpired = (data) => {
    return ManagerContract.methods
        .flagComponentAsExpired(data)
        .send({from: account.address, gas: 4000000});
} 

const flagComponentAsBroken = (data) => {
    return ManagerContract.methods
        .flagComponentAsBroken(data)
        .send({from: account.address, gas: 4000000});
}

const repair = (data) => {
    return ManagerContract.methods
        .repair(data)
        .send({from: account.address, gas: 4000000});
}

const submitFOrRecycling = (data) => {
    return ManagerContract.methods
        .submitForRecycling(data)
        .send({from: account.address, gas: 4000000});
}

const recycle = (data) => {
    return ManagerContract.methods
        .recycle(data)
        .send({from: account.address, gas: 4000000});
}

const destroy = (data) => {
    return ManagerContract.methods
        .destroy(data)
        .send({from: account.address, gas: 4000000});
}

// TODO: Updates might fail
const updateComponentName = (data) => {
    return ManagerContract.methods
        .updateComponentName(data)
        .send({from: account.address, gas: 4000000});
}

const updateComponentExpiration = (data) => {
    return ManagerContract.methods
        .updateComponentExpiration(data)
        .send({from: account.address, gas: 4000000});
}

const updateComponentPrice = (data) => {
    return ManagerContract.methods
        .updateComponentPrice(data)
        .send({from: account.address, gas: 4000000});
}

const updateComponentOtherInformation = (data) => {
    return ManagerContract.methods
        .updateComponentOtherInformation(data)
        .send({from: account.address, gas: 4000000});
}

const transferComponentOwnership = (data) => {
    return ManagerContract.methods
        .transferComponentOwnership(data)
        .send({from: account.address, gas: 4000000});
}

const getChildComponentAddressByIndex = (parentAddress, id) => {
    return ManagerContract.methods
        .getChildComponentAddressByIndex(parentAddress, id)
        .call({from: account.address});
}

const getChildComponentIndexByAddress = (parentAddress, childAddress) => {
    return ManagerContract.methods
        .getChildComponentIndexByAddress(parentAddress, childAddress)
        .call({from: account.address});
} 

const getChildComponentListOfAddress = (parentAddress) => {
    return ManagerContract.methods
        .getChildComponentListOfAddress(parentAddress)
        .call({from: account.address});
} 

const getComponentData = (address) => {
    return ManagerContract.methods
        .getComponentData(address)
        .call({from: account.address});
} 

const getComponentOwner = (address) => {
    return ManagerContract.methods
        .getComponentOwner(address)
        .call({from: account.address});
} 
const getRegistrySize = () => {
    return ManagerContract.methods
        .getRegistrySize
        .call({from: account.address});
}

const getRegistredComponentAtIndex = (index) => {
    return ManagerContract.methods
        .getRegistredComponentAtIndex(index)
        .call({from: account.address});
} 

// done
const getRegistredComponents = () => {
    return ManagerContract.methods
        .getRegistredComponents()
        .call({from: account.address});
}

const getComponentsSubmitedForSale = () => {
    return ManagerContract.methods
        .getComponentsSubmitedForSale()
        .call({from: account.address});
}

// TODO: correct this
const getComponentOfferSize = (componentAddress) => {
    return ManagerContract.methods
        .getComponentOfferSize(componentAddress)
        .call({from: account.address});
}

const getComponentOfferByIndex = (componentAddress, index) => {
    return ManagerContract.methods
        .getComponentOfferByIndex(componentAddress, index)
        .call({from: account.address});
}

const isProducer = (actorAddress) => {
    return ManagerContract.methods
        .isProducer(actorAddress)
        .call({from: account.address});
}

const isRecycler = (actorAddress) => {
    return ManagerContract.methods
        .isRecycler(actorAddress)
        .call({from: account.address});
}

const isRepairer = (actorAddress) => {
    return ManagerContract.methods
        .isRepairer(actorAddress)
        .call({from: account.address});
}

const balance = () => {
    return ManagerContract.methods
        .balance()
        .call({from: account.address});
}

const getAllowance = (spender) => {
    return ManagerContract.methods
        .getAllowance(spender)
        .call({from: account.address});
}

const getComponentReward = (componentAddress) => {
    return ManagerContract.methods
        .getComponentReward(componentAddress)
        .call({from: account.address});
}

const getProducerInfo = (producerAddress) => {
    return ManagerContract.methods
        .getProducerInfo(producerAddress)
        .call({from: account.address});
}

const getRecyclerInfo = (recyclerAddress) => {
    return ManagerContract.methods
        .getRecyclerInfo(recyclerAddress)
        .call({from: account.address});
}

const getRepairerInfo = (repairerAddress) => {
    return ManagerContract.methods
        .getRepairerInfo(repairerAddress)
        .call({from: account.address});
}

export {
    deposit,
    withdraw, 
    registerActor,
    confirmActor,
    createComponent,
    addChildComponentToComponent,
    removeChildComponentFromComponent,
    submitComponentToMarket,
    removeComponentFromMarket,
    addOffer,
    removeOffer,
    acceptOffer,
    rejectOffer,
    modifyAllowance,
    flagComponentAsExpired,
    flagComponentAsBroken,
    repair,
    submitFOrRecycling,
    recycle,
    destroy,
    updateComponentName,
    updateComponentExpiration,
    updateComponentPrice,
    updateComponentOtherInformation,
    transferComponentOwnership,
    getChildComponentAddressByIndex,
    getChildComponentIndexByAddress,
    getChildComponentListOfAddress,
    getComponentData,
    getComponentOwner,
    getRegistrySize,
    getRegistredComponentAtIndex,
    getRegistredComponents,
    getComponentsSubmitedForSale,
    getComponentOfferSize,
    getComponentOfferByIndex,
    isProducer,
    isRecycler,
    isRepairer,
    balance,
    getAllowance,
    getComponentReward,
    getProducerInfo,
    getRecyclerInfo,
    getRepairerInfo
};


