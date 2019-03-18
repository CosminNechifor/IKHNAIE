import express from 'express';
import {
    createComponent,
    getRegistredComponents,
    getRegistrySize,
    getRegistredComponentAtIndex
} from './access.js';

const app = express()
app.use(express.json())

app.get('/api/v1/size', (req, res) => {
    getRegistrySize().then(size => {
        res.status(200).send({'size': size });
    });
});

app.post('/api/v1/component', (req, res) => {
    createComponent(req.body.data).then(blockdata => {
        res.status(200).send({'blockdata': blockdata}); 
    });
});

app.get('/api/v1/component', (req, res) => {
    getRegistredComponents().then(components => {
        res.status(200).send({'components': components});
    });
});

app.get('/api/v1/component', (req, res) => {
    if (req.query.id) {
        getRegistredComponentAtIndex(req.query.id)
            .then(component => {
                res.status(200).send({'component': component});
        });
    } else if (req.query.address) {
        console.log(req.query.address)
    }
});


app.listen(3000)
console.log('app running on port ', 3000);
