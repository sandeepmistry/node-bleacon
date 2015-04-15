var EstimoteSticker = require('./estimote-sticker');

EstimoteSticker.on('discover', function(estimoteSticker) {
  console.log(estimoteSticker);
});

EstimoteSticker.startScanning();
