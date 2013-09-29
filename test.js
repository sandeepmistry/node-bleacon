var Bleacon = require('./index');


Bleacon.on('discover', function(bleacon) {
  console.log('bleacon found: ' + JSON.stringify(bleacon));
});

Bleacon.startScanning(/*'e2c56db5dffb48d2b060d0f5a71096e0', 0, 0*/);

