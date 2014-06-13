var os = require('os');
var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('pseudo - radbeacon usb');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('RadBeacon USB');
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
        uuid: '0a89139fba2b4003a72d18e332be098c',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'aaa0',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa0 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('526164426561636f6e20555342000000000000000000000000000000000000000000000000', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa0 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa1',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa1 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('303235354433', 'hex'));
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa2',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa2 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('526164426561636f6e20555342000000000000000000000000000000000000000000000000', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa2 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa3',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa3 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('2f234454cf6d4a0fadf2f4911ba9ffa6', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa3 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa4',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa4 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0001', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa4 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa5',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa5 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0001', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa5 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa6',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa6 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('be', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa6 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa7',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa7 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0f', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa7 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa8',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa8 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('a000', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa8 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaa9',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('aaa9 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('00000000', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaa9 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaaa',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaaa onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaab',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaaa onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: 'aaac',
            properties: ['write'],
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('aaaa onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
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
