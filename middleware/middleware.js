import express from 'express';
import {getRegistrySize, printBlockNumber} from './access.js';

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    printBlockNumber(1);
    getRegistrySize().then(res => console.log(res));

    return res.status(200).send({'message': 'worked' });
})

app.listen(3000)
console.log('app running on port ', 3000);
