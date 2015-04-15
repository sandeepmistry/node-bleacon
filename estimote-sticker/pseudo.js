var os = require('os');

var bleno = require('bleno');

var platform = os.platform();

console.log('pseudo - estimote sticker');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    var advertisement = Buffer.concat([
      new Buffer('03030f18', 'hex'),
      new Buffer('17ff', 'hex'),
      new Buffer('5d0101', 'hex'),
      new Buffer('0398290ef72bcff9', 'hex'),

      new Buffer('0401', 'hex') ,
      new Buffer('000000000000000000', 'hex')
    ]);

    if (platform === 'darwin') {
      bleno.startAdvertisingWithEIRData(advertisement);
    } else if (platform === 'linux') {
      var scan = new Buffer(0);
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
