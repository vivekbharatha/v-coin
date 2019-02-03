const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
  /**
   * @param {string} fromAddress 
   * @param {string} toAddress 
   * @param {number} amount 
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  /**
   * Generates a SHA hash of the transaction
   * 
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  /**
   * Signs transaction based on the elliptic keypair object as signingkey,
   * creates a signature based on transaction hash and signingKey, and 
   * stores in the transaction and block chain
   * @param {object} signingKey 
   */

  signTransaction(signingKey) {
    // Validation to check transaction from a wallet which is linked to the key with your wallet address
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('Unauthorised for this wallet');
    }
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  /**
   * Checks the signature of transaction is valid or not based on the fromAddress and signature
   * 
   * @returns {boolean}
   */

  isValid() {
    // skipping if this is reward transaction
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature for this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  /**
   * 
   * @param {number} timestamp 
   * @param {Transaction[]} transactions 
   * @param {string} previousHash 
   */
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  /**
   * Generates hash based on the block data
   * 
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  /**
   * This increments the 'nonce' until the hash of the block starts with number of zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  mineBlock(difficulty) {
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log('Block mined: ' + this.hash);
  }

  /**
   * Validates all transactions of a block based on signature and hash
   * returns true if everything is valid. False if any transaction of block is invalid.
   *
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 5;
  }

  /**
   * Staring block of the chain called as genesis block
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(Date.now(), 'genesis block', '0');
  }

  /**
   * Returns the latest block of chain
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Create block with all pendingTransactions including the reward transaction
   *
   * @param {string} miningRewardAddress
   */
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

  /**
   * Adds a new transaction to the pendingTransactions and gets executed when mining is triggered
   *
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from address and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction');
    }

    this.pendingTransactions.push(transaction);
  }

   /**
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
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

  /**
   * Returns all the transactions of a given wallet address
   *
   * @param  {string} address
   * @return {Transaction[]}
   */
  getAllTransactionsForWallet(address) {
    const transactions = [];

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address || transaction.toAddress === address) {
          transactions.push(transaction);
        }
      }
    }

    return transactions;
  }
  /**
   * Checks each and evey block and their linkage,
   * validates all transactions in each block
   * 
   * @returns {boolean}
   */
  isChainValid() {
    for (let c = 1; c < this.chain.length; c++) {
      const currentBlock = this.chain[c];
      const previousBlock = this.chain[c-1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

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

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;