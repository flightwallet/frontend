import Qrcode from 'qrcode'


const canvas = document.getElementById('canvas')

const newQr = (string, options) => {
  Qrcode.toCanvas(canvas, string, options, function (error) {
    if (error) console.error(error)
    console.log('success!')
  })
}

export {
  newQr,
}




