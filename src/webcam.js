import Instascan from 'instascan'


const init = async (id) => {
  const videoElem = await document.getElementById(id)
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
