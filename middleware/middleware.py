from web3 import Web3, HTTPProvider
from flask import Flask, jsonify, request
import json


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


if __name__ == '__main__':
    app.run()

