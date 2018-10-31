import axios from 'axios'
import BigNumber from 'bignumber.js'
import bitcoin from 'bitcoinjs-lib'

import { init } from './webcam'
import { newQr } from './qrcode'


const input   = document.getElementById('title')
const number  = document.getElementById('numberInput')
const btn = document.getElementById('generate')


btn.onclick = () => generate()
const generate = () => {
  bitcoin.address.toOutputScript(input.value, bitcoin.networks.testnet)

  const scanner = init()

  scanner.addListener('scan', async address => {
    const creating = await send(address, number.value)

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

  if (totalUnspent < fundValue + feeValue) {
    throw new Error(`Insufficient funds: totalUnspent < fundValue + feeValue: ${totalUnspent} < ${fundValue} + ${feeValue}`)
  }

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
  tx.addOutput(input.value, fundValue)
  tx.addOutput(from, skipValue)

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
    const creating = await broadcastTx(result)

    if (creating) {
      scanner.stop()
    }
  })
}

const checkTx = (txRaw) => {
  const tx = bitcoin.TransactionBuilder.fromTransaction(bitcoin.Transaction.fromHex(txRaw), bitcoin.networks.testnet)
  console.log('tx before', tx)

  const account = new bitcoin.ECPair.fromWIF('',  bitcoin.networks.testnet)
  console.log('keyPair', account)

  tx.inputs.forEach((input, index) => {
    tx.sign(index, account)
  })

  console.log('tx after', tx)

  const signTx = tx.build()

  // sendQrSignTx(signTx.toHex())
  broadcastTx(signTx.toHex())
    .then(res => alert(res.data.txid))
}


const sendQrSignTx = (tx) => {
  newQr(JSON.stringify(tx), {
    scale: 10,
    width: 650,
    margin: 1,
  })

  const scanner = init()

  scanner.addListener('scan', async result => {
    console.log('scan', result)

    broadcastTx(result)
      .then(res => alert(res.data.txid))
  })
}



