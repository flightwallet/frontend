const QRCode = require('qrcode')

let canvas = document.getElementById('canvas')


const opts = {
  scale: 15,
  margin: 1,
}


QRCode.toCanvas(canvas, 'sample text', opts, function (error) {
  if (error) console.error(error)
  console.log('success!');
})




