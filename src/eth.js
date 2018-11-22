import Web3 from 'web3'
import EthereumTx from 'ethereumjs-tx'

const NETWORK = 'testnet'

const WEB3_PROVIDERS = {
  mainnet: new Web3.providers.HttpProvider(`https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl`),
  testnet: new Web3.providers.HttpProvider(`https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl`),
  localnet: new Web3.providers.HttpProvider(`http://localhost:7545`),
}

export const web3 = new Web3(WEB3_PROVIDERS[NETWORK])

export const fetchBalance = async (address) => {
  return web3.eth.getBalance(address)
    // .then(wei => web3.utils.fromWei(wei))
}

export const fetchNonce = async (address) => {
  return web3.eth.getTransactionCount(address)
}

export const buildTx = async (fromAddress, to, value, data = '') => {
  const nonce = await web3.eth.getTransactionCount(fromAddress) + 1
  const gasPrice = await web3.eth.getGasPrice().then(wei => Number(wei))

  const draftTxParams = {
    nonce,
    gasPrice,
    to,
    value,
    data,
    // EIP 155 chainId - mainnet: 1, ropsten: 3, rinkeby: 4
    chainId: 4
  }

  const gasLimit = 21000 //await web3.eth.estimateGas(draftTxParams) || 21000

  const txParams = {
    ...draftTxParams,
    gasLimit,
  }

  console.log('tx params', txParams)
  const tx = new EthereumTx(txParams)
  console.log('tx', tx)
  const buffer = tx.serialize()
  const hex = buffer.toString('hex')
  console.log('tx hex', hex)

  return hex
}

export const publishTx = async (rawhex) => {
  return web3.eth.sendSignedTransaction(rawhex)
}

export default web3
