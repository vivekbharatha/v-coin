const SHA256 = require('crypto-js/sha256');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log('Block mined: ' + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 5;
  }

  createGenesisBlock() {
    return new Block(Date.now(), 'genesis block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    if (this.pendingTransactions.length === 0) {
      return;
    }
    this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward));
    let block = new Block(Date.now(), this.pendingTransactions);
    block.previousHash = this.chain[this.chain.length - 1].hash;
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let c = 1; c < this.chain.length; c++) {
      const currentBlock = this.chain[c];
      const previousBlock = this.chain[c-1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

let vCoin = new Blockchain();
vCoin.createTransaction(new Transaction('ad1', 'ad2', 110));
vCoin.createTransaction(new Transaction('ad2', 'ad1', 10));

console.log('Starting the miner.....');
vCoin.minePendingTransactions('vivek-vcoin');
console.log('Balance of vivek-vcoin', vCoin.getBalanceOfAddress('vivek-vcoin'));
console.log('Balance of vivek-vcoin', vCoin.getBalanceOfAddress('ad1'));
console.log('Balance of vivek-vcoin', vCoin.getBalanceOfAddress('ad2'));
