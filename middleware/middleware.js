import express from 'express';
import * as access from './access.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Status Confirmed
app.get('/api/v1/size', (req, res) => {
    access.getRegistrySize().then(size => {
        res.status(200).send({'size': size });
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

// STATUS: Confirmed
app.get('/api/v1/component', (req, res) => {
    access.getRegistredComponents().then(components => {
        res.status(200).send({'components': components});
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.get('/api/v1/balance', (req, res) => {
    access.balance().then(amount => {
        res.status(200).send({'balance': amount});
    }).catch(e => {
        res.status(400).send({'error': e});
    });
});

app.post('/api/v1/deposit', (req, res) => {
    access.deposit(
        req.body.amount
    ).then((amount) => {
        console.log(amount);
        res.status(200).send({'blockdata': amount}); 
    }).catch((e) => {
        console.log(e);
        res.status(400).send({'error': e});
    });
});

app.post('/api/v1/withdraw', (req, res) => {
    access.withdraw(
        req.body.amount
    ).then(blockdata => {
        res.status(200).send({'blockdata': blockdata}); 
    }).catch(e => {
        console.log(e);
        res.status(400).send({'error': e});
    });
});


app.post('/api/v1/component', (req, res) => {
    access.createComponent(
        req.body._entityName,
        req.body._expirationTime,
        req.body._price,
        req.body._otherInformation,
        req.body._amount
    ).then(blockdata => {
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
    getComponentInfo(req.params.address).then(data => {
        res.status(200).send({
            'data': data['1'],
            'parentAddress': data['0'],
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
