from web3 import Web3, HTTPProvider
from flask import Flask, jsonify, request
from enum import Enum
import json


class ActorType(Enum):
    PRODUCER = 1
    RECYCLER = 2
    REPAIRER = 3
    USER = 4


info_json = None
with open('../blockchain/build/contracts/Manager.json') as f:
    info_json = json.load(f)

w3 = Web3(HTTPProvider("http://localhost:8540"))
w3.eth.defaultAccount = w3.eth.accounts[0]

manager = w3.eth.contract(
    address="0x4D73457De69bE9a0C8524660Ff67f261D2Ff2c7f",
    abi=info_json['abi']
)

app = Flask(__name__)


@app.route('/api/v1/balance', methods=['GET'])
def get_balance():
    balance = manager.functions.balance().call()
    return jsonify({'balance': balance})


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
        if actor_type == ActorType.PRODUCER:
            tx_hash = manager.functions.registerProducer(
                content['name'],
                content['information']
            ).transact(
                {'from': w3.eth.accounts[0], 'value': content['amount']}
            )
        elif actor_type == ActorType.RECYCLER:
            tx_hash = manager.functions.registerRecycler(
                content['name'],
                content['information']
            ).transact(
                {'from': w3.eth.accounts[0], 'value': content['amount']}
            )
        elif actor_type == ActorType.REPAIRER:
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
        if actor_type == ActorType.PRODUCER:
            tx_hash = manager.functions.confirmProducer(
                content['address']
            ).transact(
                {'from': w3.eth.accounts[0]}
            )
        elif actor_type == ActorType.RECYCLER:
            tx_hash = manager.functions.confirmRecycler(
                content['address']
            ).transact(
                {'from': w3.eth.accounts[0]}
            )
        elif actor_type == ActorType.REPAIRER:
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


if __name__ == '__main__':
    app.run(debug=True)
