import Web3 from 'web3';
import * as fs from 'fs';

const contractAddress = '0xE29142470E9d86441EeC6b8B1014650Eb0c47104';
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
    return contract.methods.getRegistrySize.call({from: account.address});
}

const createComponent = (data) => {
    return contract.methods.createComponent(data).send({from: account.address, gas: 3900000});
} 

export {getRegistrySize, createComponent};


