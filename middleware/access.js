import Web3 from 'web3';
import * as fs from 'fs';

const contractAddress = '0xad934659b1e341dE46442E77437655B51aDe3dB3';
const priv_key = '0x876258c7c6c0eecff9c179a76b2f002bc9a35cde23ff4fbc7df17f8f683e1614'

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8540");

const getManagerJSON = () => {
    const rawdata = fs.readFileSync('../blockchain/build/contracts/Manager.json');  
    return JSON.parse(rawdata);  
}

const createContractInterface = () => {
    const ManagerJSON = getManagerJSON();
    return web3.eth.Contract(
        ManagerJSON.abi,
        contractAddress
    );
}

const contract = createContractInterface();
const account = web3.eth.accounts.privateKeyToAccount(priv_key);


const getRegistrySize = () => {
    return contract.methods
        .getRegistrySize
        .call({from: account.address});
}

const createComponent = (data) => {
    return contract.methods
        .createComponent(data)
        .send({from: account.address, gas: 3900000});
} 

const getRegistredComponents = () => {
    return contract.methods
        .getRegistredComponents()
        .call({from: account.address});
}

const getRegistredComponentAtIndex = (index) => {
    return contract.methods
        .getRegistredComponentAtIndex(index)
        .call({from: account.address});
} 

const getComponentOwner = (address) => {
    return contract.methods
        .getComponentOwner(address)
        .call({from: account.address});
} 

const getComponentData = (address) => {
    return contract.methods
        .getComponentData(address)
        .call({from: account.address});
} 

const getChildComponentIndexByAddress = (parentAddress, childAddress) => {
    return contract.methods
        .getChildComponentIndexByAddress(parentAddress, childAddress)
        .call({from: account.address});
} 

const getChildComponentAddressByIndex = (parentAddress, id) => {
    return contract.methods
        .getChildComponentAddressByIndex(parentAddress, id)
        .call({from: account.address});
} 

// returns a promise
const updateData = (address, data) => {
    return contract.methods
        .updateData(address, data)
        .send({from: account.address, gas: 4000000});
} 

//returns a promise
const removeChildComponentFromComponent = (parentAddress, id) => {
    return contract.methods
        .removeChildComponentFromComponent(parentAddress, id)
        .send({from: account.address, gas: 4000000});
} 

//returns a promise
const addChildComponentToComponent = (parentAddress, childAddress) => {
    returns contract.methods
        .addChildComponentToComponent(parentAddress, childAddress)
        .send({from: account.address, gas: 4000000});
}

export {
    getRegistrySize,
    createComponent,
    getRegistredComponents,
    getRegistredComponentAtIndex
};


