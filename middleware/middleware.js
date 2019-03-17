import express from 'express';
import Web3 from 'web3';

const app = express()
app.use(express.json())

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8540");
console.log(web3);

// test connections
const getBlockNumber = () => {
    web3.eth.getBlock(1, (error, result) => {
        if(!error)
            console.log(JSON.stringify(result));
        else
            console.error(error);
    });
}

app.get('/', (req, res) => {
    getBlockNumber()
    return res.status(200).send({'message': 'worked' });
})


app.listen(3000)
console.log('app running on port ', 3000);
