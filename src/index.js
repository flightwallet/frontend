import axios from 'axios'
import bitcoin from 'bitcoinjs-lib'

import { init } from './webcam'
import { newQr } from './qrcode'

const step1  = document.getElementById('step-1')
const step2  = document.getElementById('step-2')
const step5  = document.getElementById('step-5')

const input   = document.getElementById('title')
const start   = document.getElementById('generateBtn')
const reloadBtn   = document.getElementById('reloadBtn')
const txHex  = document.getElementById('txHex')

start.onclick = () => generate()
const generate = async () => {
  bitcoin.address.toOutputScript(input.value, bitcoin.networks.testnet)
  step2.style.display = 'flex'

  window.localStorage.setItem('coffee', JSON.stringify(input.value))
  const amount = selectCurrency === 'ETH' ? 0.0001 : 0.0002

  createQrSignTx(`bitcoin:${input.value}?amount=${amount}`)
  step1.style.display = 'none'
}


const broadcastTx = (txRaw) => {
  return axios.post(`https://test-insight.bitpay.com/api/tx/send`, {
    rawtx: txRaw,
  })
}


const createQrSignTx = async (txRaw) => {
  newQr(txRaw, {
    scale: 10,
    width: 400,
    margin: 1,
  })

  const scanner = await init('qrScanner1')

  step5.style.display = 'flex'
  scanner.addListener('scan', async txRaw => {
    const result = await broadcastTx(txRaw)

    if (result) {
      txHex.innerHTML = result.data.txid.slice(1, 18)
      txHex.href = 'https://live.blockcypher.com/btc-testnet/tx/' + result.data.txid

      alert('SUCCESS')

      reloadBtn.style.display = 'block'
      scanner.stop()
    }
  })
}



