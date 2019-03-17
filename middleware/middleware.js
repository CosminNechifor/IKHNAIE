import express from 'express';
import {getRegistrySize, createComponent} from './access.js';

const app = express()
app.use(express.json())

app.get('/size', (req, res) => {
    getRegistrySize().then(size => {
        res.status(200).send({'size': size });
    });
});

app.post('/component', (req, res) => {
    createComponent(req.body.data).then(blockdata=> {
        res.status(200).send({'blockdata': blockdata}); 
    });
});

app.listen(3000)
console.log('app running on port ', 3000);
