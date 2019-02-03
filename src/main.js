const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { Blockchain, Transaction } = require('./core');

const myKey = ec.keyFromPrivate('31fc91751bc83f6b921f343bb4f5271abfd728fc84d1286f22548d2a7e902f08');
const myWalletAddress = myKey.getPublic('hex');

let vCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'publc key goes here', 1);
tx1.signTransaction(myKey);
vCoin.addTransaction(tx1);

console.log('Starting the miner.....');
vCoin.minePendingTransactions(myWalletAddress);
console.log('Balance: ', vCoin.getBalanceOfAddress(myWalletAddress));

// console.log(JSON.stringify(vCoin, null, 2));
console.log('is chain valid ?', vCoin.isChainValid());
