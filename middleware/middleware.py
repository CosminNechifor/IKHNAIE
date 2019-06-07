from web3 import Web3, HTTPProvider
from web3.contract import ConciseContract
from flask import Flask, jsonify, request
import json


info_json = None
with open('../blockchain/build/contracts/Manager.json') as f:
    info_json = json.load(f)

w3 = Web3(HTTPProvider("http://localhost:8540"))

manager = w3.eth.contract(
    address="0x4D73457De69bE9a0C8524660Ff67f261D2Ff2c7f",
    abi=info_json['abi']
)
w3.eth.defaultAccount = w3.eth.accounts[0]

app = Flask(__name__)

@app.route('/api/v1/deposit', methods=['POST'])
def deposit():
    content = request.json
    tx_hash = manager.functions.deposit().transact({'from': w3.eth.accounts[0], 'value': content['amount']})
    w3.eth.waitForTransactionReceipt(tx_hash)
    balance = manager.functions.balance().call()
    return jsonify({'new_balance':balance})

app.run()
