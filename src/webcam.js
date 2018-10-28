import Instascan from 'instascan'

const videoElem = document.getElementById('qrScanner')


const init = () => {
  const scanner = new Instascan.Scanner({ video: videoElem })

  Instascan.Camera.getCameras().then(cameras => {
    if (cameras.length > 0) {
      scanner.start(cameras[0])
    }
  })

  return scanner
}


export {
  init,
}
