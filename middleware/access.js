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

const getRegistrySize = () => {
    return ManagerContract.methods
        .getRegistrySize
        .call({from: account.address});
}

const createComponent = (data) => {
    return ManagerContract.methods
        .createComponent(data)
        .send({from: account.address, gas: 3900000});
} 

const getRegistredComponents = () => {
    return ManagerContract.methods
        .getRegistredComponents()
        .call({from: account.address});
}

const getRegistredComponentAtIndex = (index) => {
    return ManagerContract.methods
        .getRegistredComponentAtIndex(index)
        .call({from: account.address});
} 

const getComponentOwner = (address) => {
    return ManagerContract.methods
        .getComponentOwner(address)
        .call({from: account.address});
} 

const getComponentInfo = (address) => {
    return ManagerContract.methods
        .getComponentInfo(address)
        .call({from: account.address});
} 

const getComponentData = (address) => {
    return ManagerContract.methods
        .getComponentData(address)
        .call({from: account.address});
} 

const getChildComponentIndexByAddress = (parentAddress, childAddress) => {
    return ManagerContract.methods
        .getChildComponentIndexByAddress(parentAddress, childAddress)
        .call({from: account.address});
} 

const getChildComponentAddressByIndex = (parentAddress, id) => {
    return ManagerContract.methods
        .getChildComponentAddressByIndex(parentAddress, id)
        .call({from: account.address});
} 

const getChildComponentListOfAddress = (parentAddress) => {
    return ManagerContract.methods
        .getChildComponentListOfAddress(parentAddress)
        .call({from: account.address});
} 

const updateData = (address, data) => {
    return ManagerContract.methods
        .updateData(address, data)
        .send({from: account.address, gas: 4000000});
} 

const removeChildComponentFromComponent = (parentAddress, id) => {
    return ManagerContract.methods
        .removeChildComponentFromComponent(parentAddress, id)
        .send({from: account.address, gas: 4000000});
} 

const addChildComponentToComponent = (parentAddress, childAddress) => {
    return ManagerContract.methods
        .addChildComponentToComponent(parentAddress, childAddress)
        .send({from: account.address, gas: 4000000});
}

export {
    getRegistrySize,
    createComponent,
    getRegistredComponents,
    getRegistredComponentAtIndex,
    getComponentOwner,
    getComponentData,
    getChildComponentIndexByAddress,
    getChildComponentAddressByIndex,
    updateData,
    removeChildComponentFromComponent, 
    addChildComponentToComponent,
    getChildComponentListOfAddress,
    getComponentInfo,
};


