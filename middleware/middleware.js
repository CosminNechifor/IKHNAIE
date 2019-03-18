import express from 'express';
import {
    createComponent,
    getRegistredComponents,
    getRegistrySize,
    getRegistredComponentAtIndex,
    getComponentOwner,
    getComponentData,
    getChildComponentIndexByAddress,
    getChildComponentAddressByIndex,
    updateData,
    removeChildComponentFromComponent, 
    addChildComponentToComponent,
    getChildComponentListOfAddress
} from './access.js';

const app = express()
app.use(express.json())

app.get('/api/v1/size', (req, res) => {
    getRegistrySize().then(size => {
        res.status(200).send({'size': size });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/component', (req, res) => {
    getRegistredComponents().then(components => {
        res.status(200).send({'components': components});
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.post('/api/v1/component', (req, res) => {
    createComponent(req.body.data).then(blockdata => {
        res.status(200).send({'blockdata': blockdata}); 
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/component/:id', (req, res) => {
    getRegistredComponentAtIndex(req.params.id).then(component => {
            res.status(200).send({'component': component});
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/_component/:address', (req, res) => {
    getComponentData(req.params.address).then(data => {
        res.status(200).send({
            'data': data,
            'componentAddress': req.params.address 
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.put('/api/v1/_component/:address', (req, res) => {
    updateData(
        req.params.address,
        req.body.data
    ).then(blockdata => {
        res.status(200).send({'blockdata': blockdata}); 
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/_component/:address/owner', (req, res) => {
    getComponentOwner(req.params.address).then(owner => {
        res.status(200).send({
            'owner': owner,
            'componentAddress': req.params.address 
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/_component/:parentAddress/child', (req, res) => {
    getChildComponentListOfAddress(
        req.params.parentAddress,
    ).then(addressList => {
        res.status(200).send({
            'childComponentsAddresses': addressList,
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/_component/:parentAddress/child/:childIndex', (req, res) => {
    getChildComponentAddressByIndex(
        req.params.parentAddress,
        req.params.childIndex
    ).then(address => {
        res.status(200).send({
            'childAddress': address,
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/_component/:parentAddress/_child/:childAddress', (req, res) => {
    getChildComponentIndexByAddress(
        req.params.parentAddress,
        req.params.childAddress
    ).then(index => {
        res.status(200).send({
            'componentAtIndex': index
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.post('/api/v1/_component/:parentAddress/_child/:childAddress', (req, res) => {
    addChildComponentToComponent(
        req.params.parentAddress,
        req.params.childAddress
    ).then(index => {
        res.status(200).send({
            'parrentAddress': req.params.parentAddress,
            // have to change this, because it returns the blockdata
            'componentAddedAtIndex': index
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.delete('/api/v1/_component/:parentAddress/child/:id', (req, res) => {
    removeChildComponentFromComponent(
        req.params.parentAddress,
        req.params.id
    ).then(index => {
        res.status(200).send({
            'parrentAddress': req.params.parrentAddress,
            'componentRemoved': index
        });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.listen(3000)
console.log('app running on port ', 3000);
