from web3 import Web3, HTTPProvider
from flask import Flask, jsonify, request
from werkzeug.exceptions import NotFound
from werkzeug.routing import BaseConverter
from flask_cors import CORS
import json
from eth_utils import (
    is_0x_prefixed,
    is_checksum_address,
    to_canonical_address,
    to_checksum_address,
    to_hex,
)


class InvalidEndpoint(NotFound):
    pass


class HexAddressConverter(BaseConverter):
    @staticmethod
    def to_python(value):
        if not is_0x_prefixed(value):
            raise InvalidEndpoint(
                "Not a valid hex address, 0x prefix missing."
            )

        if not is_checksum_address(value):
            raise InvalidEndpoint("Not a valid EIP55 encoded address.")

        try:
            value = to_canonical_address(value)
        except ValueError:
            raise InvalidEndpoint("Could not decode hex.")

        return value

    @staticmethod
    def to_url(value):
        return to_checksum_address(value)


def restapi_setup_type_converters(flask_app, names_to_converters):
    for key, value in names_to_converters.items():
        flask_app.url_map.converters[key] = value


info_json = None
with open('../blockchain/build/contracts/Manager.json') as f:
    info_json = json.load(f)

w3 = Web3(HTTPProvider("http://localhost:8540"))
w3.eth.defaultAccount = w3.eth.accounts[0]

manager = w3.eth.contract(
    address="0x32bb66162d0adaF00C2E8227B40B7274c4D610ce",
    abi=info_json['abi']
)

app = Flask(__name__)
CORS(app)
restapi_setup_type_converters(app, {"hexaddress": HexAddressConverter})


@app.route('/api/v1/test', methods=['GET'])
def pong():
    return jsonify({'result': 'Pong'})

@app.route('/api/v1/deposit', methods=['POST'])
def deposit():
    content = request.json
    tx_hash = manager.functions.deposit().transact(
        {'from': w3.eth.accounts[0], 'value': content['amount']}
    )
    w3.eth.waitForTransactionReceipt(tx_hash)
    balance = manager.functions.balance().call()
    return jsonify({'new_balance': balance})


@app.route('/api/v1/withdraw', methods=['POST'])
def withdraw():
    content = request.json
    tx_hash = manager.functions.withdraw(
        content['amount']
    ).transact(
        {'from': w3.eth.accounts[0]}
    )
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    print(receipt)
    balance = manager.functions.balance().call()
    return jsonify({'new_balance': balance})


@app.route('/api/v1/register_actor', methods=['POST'])
def register_actor():
    try:
        content = request.json

        if len(content.keys()) < 4:
            return jsonify({'message': 'Missing argument'}), 400

        tx_hash = None

        actor_type = content['type']
        if actor_type == 'Producer':
            tx_hash = manager.functions.registerProducer(
                content['name'],
                content['information']
            ).transact(
                {'from': w3.eth.accounts[0], 'value': content['amount']}
            )
        elif actor_type == 'Recycler':
            tx_hash = manager.functions.registerRecycler(
                content['name'],
                content['information']
            ).transact(
                {'from': w3.eth.accounts[0], 'value': content['amount']}
            )
        elif actor_type == 'Repairer':
            tx_hash = manager.functions.registerRepairer(
                content['name'],
                content['information']
            ).transact(
                {'from': w3.eth.accounts[0], 'value': content['amount']}
            )

        receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        return jsonify(
            {
                'receipt': str(receipt)
            }
        ), 200
    except KeyError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    return jsonify({'message': 'Invalid data'}), 400


@app.route('/api/v1/confirm_actor', methods=['POST'])
def confirm_actor():
    try:
        tx_hash = None
        content = request.json
        actor_type = content['type']
        if actor_type == 'Producer':
            tx_hash = manager.functions.confirmProducer(
                content['address']
            ).transact(
                {'from': w3.eth.accounts[0]}
            )
        elif actor_type == 'Recycler':
            tx_hash = manager.functions.confirmRecycler(
                content['address']
            ).transact(
                {'from': w3.eth.accounts[0]}
            )
        elif actor_type == 'Repairer':
            tx_hash = manager.functions.confirmRepairer(
                content['address']
            ).transact(
                {'from': w3.eth.accounts[0]}
            )
        receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        return jsonify(
            {
                'receipt': str(receipt)
            }
        ), 200
    except KeyError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    return jsonify({'message': 'Invalid data'}), 400


@app.route('/api/v1/component', methods=['POST'])
def create_component():
    try:
        content = request.json
        tx_hash = manager.functions.createComponent(
            content['name'],
            content['expirationTime'],
            content['price'],
            content['otherInformation'],
        ).transact({
            'from': w3.eth.accounts[0],
            'value': content['value']
        })
        receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        return jsonify(
            {
                'receipt': str(receipt)
            }
        ), 200
    except KeyError as e:
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 400
    return jsonify({'message': 'Invalid data'}), 400


@app.route(
    '/api/v1/component/<hexaddress:parent_component>/child/<hexaddress:child_component>',
    methods=['POST']
)
def add_child_to_component(parent_component, child_component):
    parent_address = to_checksum_address(to_hex(parent_component))
    child_address = to_checksum_address(to_hex(child_component))
    tx_hash = manager.functions.addChildComponentToComponent(
        parent_address,
        child_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:parent_component>/child/<hexaddress:child_component>',
    methods=['DELETE']
)
def remove_child_from_component(parent_component, child_component):
    parent_address = to_checksum_address(to_hex(parent_component))
    child_address = to_checksum_address(to_hex(child_component))
    tx_hash = manager.functions.removeChildComponentFromComponent(
        parent_address,
        child_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>',
    methods=['POST']
)
def submit_component_to_market(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.submitComponentToMarket(
        component_address,
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>',
    methods=['DELETE']
)
def remove_component_from_market(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.removeComponentFromMarket(
        component_address,
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>/offer',
    methods=['POST']
)
def add_offer(component):
    component_address = to_checksum_address(to_hex(component))
    content = request.json
    amount = content['amount']
    tx_hash = manager.functions.addOffer(
        component_address,
        amount
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>/offer/<int:index>',
    methods=['DELETE']
)
def remove_offer(component, index):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.removeOffer(
        component_address,
        index
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>/offer/<int:index>/accept',
    methods=['POST']
)
def accept_offer(component, index):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.acceptOffer(
        component_address,
        index
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/market/<hexaddress:component>/offer/<int:index>/reject',
    methods=['POST']
)
def reject_offer(component, index):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.rejectOffer(
        component_address,
        index
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/allowance/<hexaddress:spender>',
    methods=['POST']
)
def modify_allowance(spender):
    spender_address = to_checksum_address(to_hex(spender))
    content = request.json
    new_allowance = content['newAllowance']
    tx_hash = manager.functions.modifyAllowance(
        spender_address,
        new_allowance
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/flagAsExpired',
    methods=['POST']
)
def flag_component_as_expired(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.flagComponentAsExpired(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/flagAsBroken',
    methods=['POST']
)
def flag_component_as_broken(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.flagComponentAsBroken(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/repair',
    methods=['POST']
)
def repair(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.repair(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/submitForRecycling',
    methods=['POST']
)
def submit_for_recycling(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.submitForRecycling(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/recycle',
    methods=['POST']
)
def recycle(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.recycle(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/destroy',
    methods=['POST']
)
def destroy(component):
    component_address = to_checksum_address(to_hex(component))
    tx_hash = manager.functions.destroy(
        component_address
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/updateComponentName',
    methods=['PUT']
)
def update_component_name(component):
    component_address = to_checksum_address(to_hex(component))
    content = request.json
    tx_hash = manager.functions.updateComponentName(
        component_address,
        content['name']
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/updateComponentExpiration',
    methods=['PUT']
)
def update_component_expiration(component):
    component_address = to_checksum_address(to_hex(component))
    content = request.json
    tx_hash = manager.functions.updateComponentExpiration(
        component_address,
        content['expiration']
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:parent_component>/child/<int:index>',
    methods=['GET']
)
def get_child_by_index(parent_component, index):
    parent_address = to_checksum_address(to_hex(parent_component))
    child_address = manager.functions.getChildComponentAddressByIndex(
       parent_address,
       index
    ).call()
    return jsonify({'child_address': child_address})


@app.route(
    '/api/v1/component/<hexaddress:component>/updateComponentPrice',
    methods=['PUT']
)
def update_component_price(component):
    component_address = to_checksum_address(to_hex(component))
    content = request.json
    tx_hash = manager.functions.updateComponentPrice(
        component_address,
        content['price']
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:component>/updateComponentOtherInformation',
    methods=['PUT']
)
def update_component_otherinfo(component):
    component_address = to_checksum_address(to_hex(component))
    content = request.json
    tx_hash = manager.functions.updateComponentOtherInformation(
        component_address,
        content['otherInformation']
    ).transact({
        'from': w3.eth.accounts[0]
    })
    receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return jsonify({'receipt': str(receipt)})


@app.route(
    '/api/v1/component/<hexaddress:parent_component>/child/<hexaddress:child_component>',
    methods=['GET']
)
def get_child_index_by_address(parent_component, child_component):
    parent_address = to_checksum_address(to_hex(parent_component))
    child_address = to_checksum_address(to_hex(child_component))
    index = manager.functions.getChildComponentIndexByAddress(
       parent_address,
       child_address
    ).call()
    return jsonify({'index': index})


@app.route(
    '/api/v1/component/<hexaddress:parent_component>/child',
    methods=['GET']
)
def get_children(parent_component):
    parent_address = to_checksum_address(to_hex(parent_component))
    child_address = manager.functions.getChildComponentListOfAddress(
       parent_address
    ).call()
    return jsonify({'child_address': child_address})


@app.route(
    '/api/v1/component/<hexaddress:component>',
    methods=['GET']
)
def get_component_data(component):
    owner_index, name_index, creation_index = 0, 1, 2
    expiration_index, price_index = 3, 4
    state_index, otherinfo_index, parent_index, childlist_index = 5, 6, 7, 8
    producer_index = 9
    component_address = to_checksum_address(to_hex(component))
    data = manager.functions.getComponentData(
        component_address
    ).call()
    # needs to be changed
    return jsonify({
        'owner': data[owner_index],
        'componentName': data[name_index],
        'creationTime': data[creation_index],
        'expiration': data[expiration_index],
        'price': data[price_index],
        'state': data[state_index],
        'otherInformation': data[otherinfo_index],
        'parentComponent': data[parent_index],
        'childComponent': data[childlist_index],
        'producer': data[producer_index]
    })


@app.route(
    '/api/v1/component/<hexaddress:component>/owner',
    methods=['GET']
)
def get_component_owner(component):
    component_address = to_checksum_address(to_hex(component))
    data = manager.functions.getComponentOwner(
        component_address
    ).call()
    # needs to be changed
    return jsonify({
        'owner': data,
    })


@app.route('/api/v1/registry/size', methods=['GET'])
def get_size():
    size = manager.functions.getRegistrySize().call()
    return jsonify({'size': size})


@app.route('/api/v1/registry/<int:index>', methods=['GET'])
def get_registred_component_by_index(index):
    component = manager.functions.getRegistredComponentAtIndex(
        index
    ).call()
    return jsonify({'component': component})


@app.route('/api/v1/component', methods=['GET'])
def get_components():
    components = manager.functions.getRegistredComponents().call()
    return jsonify({'components': components})


@app.route('/api/v1/market', methods=['GET'])
def get_components_submited():
    components = manager.functions.getComponentsSubmitedForSale().call()
    return jsonify({'components': components})


@app.route('/api/v1/market/<hexaddress:component>/size', methods=['GET'])
def get_component_offer_size(component):
    offer_size = manager.functions.getComponentOfferSize(
        component
    ).call()
    return jsonify({'offer_size': offer_size})


@app.route(
    '/api/v1/market/<hexaddress:component>/offer/<int:index>',
    methods=['GET']
)
def get_component_offer_by_index(component, index):
    offer = manager.functions.getComponentOfferByIndex(
        component,
        index
    ).call()
    return jsonify({
        'amount': offer[0],
        'sender': offer[1]
    })


@app.route('/api/v1/producer/<hexaddress:producer_address>', methods=['GET'])
def check_producer(producer_address):
    is_producer = manager.functions.isProducer(
        producer_address,
    ).call()
    return jsonify({
        'isProducer': is_producer
    })


@app.route('/api/v1/recycler/<hexaddress:recycler_address>', methods=['GET'])
def check_recycler(recycler_address):
    is_recycler = manager.functions.isRecycler(
        recycler_address,
    ).call()
    return jsonify({
        'isRecycler': is_recycler
    })


@app.route('/api/v1/repairer/<hexaddress:repairer_address>', methods=['GET'])
def check_repairer(repairer_address):
    is_repairer = manager.functions.isRepairer(
        repairer_address,
    ).call()
    return jsonify({
        'isRepairer': is_repairer
    })


@app.route('/api/v1/balance', methods=['GET'])
def get_balance():
    balance = manager.functions.balance().call()
    return jsonify({'balance': balance})


@app.route('/api/v1/allowance/<hexaddress:spender>', methods=['GET'])
def get_allowance(spender):
    spender_address = to_checksum_address(to_hex(spender))
    allowance = manager.functions.getAllowance(
        spender_address
    ).call()
    return jsonify({
        'spender': spender_address,
        'allowance': allowance
    })


@app.route('/api/v1/component/<hexaddress:component>/reward', methods=['GET'])
def get_component_reward(component):
    component_address = to_checksum_address(to_hex(component))
    reward = manager.functions.getComponentReward(
        component_address
    ).call()
    return jsonify({
        'component': component_address,
        'reward': reward
    })


@app.route(
    '/api/v1/producer/<hexaddress:producer_address>/info',
    methods=['GET']
)
def get_producer_info(producer_address):
    producer_info = manager.functions.getProducerInfo(
        producer_address,
    ).call()
    return jsonify({
        'name': producer_info[0],
        'information': producer_info[1],
        'isRegistred': producer_info[2],
        'isConfirmed': producer_info[3],
    })


@app.route(
    '/api/v1/recycler/<hexaddress:recycler_address>/info',
    methods=['GET']
)
def get_recycler_info(recycler_address):
    recycler_info = manager.functions.getRecyclerInfo(
        recycler_address,
    ).call()
    return jsonify({
        'name': recycler_info[0],
        'information': recycler_info[1],
        'valueRecycled': recycler_info[2],
        'isRegistred': recycler_info[3],
        'isConfirmed': recycler_info[4],
    })


@app.route(
    '/api/v1/repairer/<hexaddress:repairer_address>/info',
    methods=['GET']
)
def get_repairer_info(repairer_address):
    repairer_info = manager.functions.getRepairerInfo(
        repairer_address,
    ).call()
    return jsonify({
        'name': repairer_info[0],
        'information': repairer_info[1],
        'isRegistred': repairer_info[2],
        'isConfirmed': repairer_info[3],
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
