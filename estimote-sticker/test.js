var EstimoteSticker = require('./estimote-sticker');

EstimoteSticker.on('discover', function(estimoteSticker, rssi) {
  console.log(estimoteSticker);
});

EstimoteSticker.startScanning();
