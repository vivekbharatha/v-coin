const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp, data, previousHash = ''){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0,'2018-05-30', 'genesis block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
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

vCoin.addBlock(new Block(1, '2019-01-01', { amount: 5 }));
vCoin.addBlock(new Block(2, '2019-01-01', { amount: 11 }));
vCoin.chain[1].data.amount = 1;
vCoin.chain[1].hash = vCoin.chain[1].calculateHash();

console.log(JSON.stringify(vCoin, null, 2));
console.log('is chain valid ? \n', vCoin.isChainValid());