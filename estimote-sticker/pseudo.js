var os = require('os');

var bleno = require('bleno');

var platform = os.platform();

console.log('pseudo - estimote sticker');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var advertisement = Buffer.concat([
      Buffer.from('03030f18', 'hex'),
      Buffer.from('17ff', 'hex'),
      Buffer.from('5d0101', 'hex'),
      Buffer.from('0398290ef72bcff9', 'hex'),

      Buffer.from('0401', 'hex') ,
      Buffer.from('000000000000000000', 'hex')
    ]);

    if (platform === 'darwin') {
      bleno.startAdvertisingWithEIRData(advertisement);
    } else if (platform === 'linux') {
      var scan = Buffer.alloc(0);
      bleno.startAdvertisingWithEIRData(advertisement, scan);
    }
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function() {
  console.log('on -> advertisingStart');
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});
