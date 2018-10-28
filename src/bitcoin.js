import axios from 'axios'
import BigNumber from 'bignumber.js'
import bitcoin from 'bitcoinjs-lib'

import { init } from './webcam'
import { newQr } from './qrcode'


const input   = document.getElementById('title')
const btn = document.getElementById('generate')


btn.onclick = () => generate()
const generate = () => {
  bitcoin.address.toOutputScript(input.value, bitcoin.networks.testnet)

  const scanner = init()

  scanner.addListener('scan', async result => {
    const creating = await send(result, 0.01)

    if (creating) {
      scanner.stop()
    }
  })
}

const broadcastTx = (txRaw) => {
  return axios.post(`https://test-insight.bitpay.com/api/tx/send`, {
    rawtx: txRaw,
  })
}

const fetchUnspents = async (address) => {
  return axios.get(`https://test-insight.bitpay.com/api/addr/${address}/utxo`)
    .then(result => {
      console.log('data', result.data)
      return result.data
    })
}

const send = async (from, amount) => {
  const tx            = new bitcoin.TransactionBuilder(bitcoin.networks.testnet)
  const unspents      = await fetchUnspents(from)

  const fundValue     = new BigNumber(String(amount)).multipliedBy(1e8).integerValue().toNumber()
  const feeValue      = 15000
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue     = totalUnspent - fundValue - feeValue

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(input.value, fundValue)
  tx.addOutput(from, skipValue)

  console.log('tx send', tx)

  const txRaw = tx.buildIncomplete()

  createQrSignTx(txRaw.toHex())

  return true
}

const createQrSignTx = (txRaw) => {
  newQr(txRaw, {
    scale: 10,
    width: 400,
    margin: 1,
  })

  const scanner = init()

  scanner.addListener('scan', async result => {
    const creating = await checkTx(result)

    if (creating) {
      scanner.stop()
    }
  })
}

console.log('bitcoin', bitcoin)

const checkTx = (txRaw) => {
  const tx = bitcoin.TransactionBuilder.fromTransaction(bitcoin.Transaction.fromHex(txRaw), bitcoin.networks.testnet)
  console.log('tx before', tx)

  const account = new bitcoin.ECPair.fromWIF('cReuao13Vz9keT5VB8gQ1nP79eCWoYEatAqkyfjig3Xsx4vBXSGc',  bitcoin.networks.testnet)
  console.log('keyPair', account)

  tx.inputs.forEach((input, index) => {
    tx.sign(index, account)
  })

  console.log('tx after', tx)

  const signTx = tx.build()

  newQr(JSON.stringify(signTx.toHex()), {
    scale: 10,
    width: 650,
    margin: 1,
  })

  sendQrSignTx()
  // broadcastTx()
  //   .then(res => alert(res.data.txid))
}


const sendQrSignTx = () => {
  const scanner = init()

  scanner.addListener('scan', async result => {
    console.log('sacn', result)

    broadcastTx(result)
      .then(res => alert(res.data.txid))
  })
}



