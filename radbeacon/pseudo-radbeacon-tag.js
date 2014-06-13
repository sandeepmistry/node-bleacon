var os = require('os');
var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('pseudo - radbeacon tag');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('RadBeacon');
  } else {
    bleno.stopAdvertising();
  }
});

var lastCommand = null;

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart ' + error);

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: '248e4f81e46c4762bf3f84069c5c3f09',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '4f82',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('4f82 onWriteRequest ' + data.toString('hex'));

              lastCommand = 'pin';

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '4f83',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('4f83 onWriteRequest ' + data.toString('hex'));

              lastCommand = data[0];

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '4f84',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('4f84 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '4f85',
            properties: ['read', 'notify'],
            onReadRequest: function(offset, callback) {
              console.log('4f85 onReadRequest');

              var data;

              if (lastCommand === 'pin') {
                data = new Buffer('01', 'hex'); // 01 - correct pin, 00 - incorrect pin
              } else if (lastCommand === 0x87) {
                data = new Buffer('RadBeacon Tag');
              } else if (lastCommand === 0x90) {
                data = new Buffer('e2c56db5dffb48d2b060d0f5a71096e0', 'hex');
              } else if (lastCommand === 0x91) {
                data = new Buffer('0001', 'hex');
              } else if (lastCommand === 0x92) {
                data = new Buffer('0002', 'hex');
              } else if (lastCommand === 0x93) {
                data = new Buffer('c5', 'hex');
              } else if (lastCommand === 0x84) {
                data = new Buffer('04', 'hex');
              } else if (lastCommand === 0x82) {
                data = new Buffer('0064', 'hex');
              } else if (lastCommand === 0xa0) {
                data = new Buffer('32', 'hex');
              }

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onSubscribe: function(maxValueSize, updateValueCallback) {
              console.log('4f85 onSubscribe');
            },
            onUnsubscribe: function() {
              console.log('4f85 onUnsubscribe');
            }
          })
        ]
      })
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('on -> servicesSet');
});
