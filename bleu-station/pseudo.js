var os = require('os');
var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

console.log('pseudo - bleu station');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('TC000000');
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart ' + error);

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: '180a',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '2a29',
            properties: ['read'],
            value: new Buffer('TwoCanoes')
          }),
          new BlenoCharacteristic({
            uuid: '2a24',
            properties: ['read'],
            value: new Buffer('iBeacon Demo')
          }),
          new BlenoCharacteristic({
            uuid: '2a27',
            properties: ['read'],
            value: new Buffer('0.0.0')
          }),
          new BlenoCharacteristic({
            uuid: '2a26',
            properties: ['read'],
            value: new Buffer('0.0.0')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: 'b0702880a295a8abf734031a98a512de',
        characteristics: [
          new BlenoCharacteristic({
              uuid: 'b0702881a295a8abf734031a98a512de',
              properties: ['read'],
              value: new Buffer('e2c56db5dffb48d2b060d0f5a71096e0', 'hex')
          }),
          new BlenoCharacteristic({
              uuid: 'b0702882a295a8abf734031a98a512de',
              properties: ['read'],
              value: new Buffer('0001', 'hex')
          }),
          new BlenoCharacteristic({
              uuid: 'b0702883a295a8abf734031a98a512de',
              properties: ['read'],
              value: new Buffer('0002', 'hex')
          }),
          new BlenoCharacteristic({
              uuid: 'b0702884a295a8abf734031a98a512de',
              properties: ['read'],
              value: new Buffer('c4', 'hex')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '2141aae18f8249daae256d6914825018',
        characteristics: [
          // dummy
          new BlenoCharacteristic({
            uuid: '00000000000000000000000000000000',
            properties: ['read'],
            value: ''
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '2e88378c47ee48a8bc1374ec0d4ab559',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'c8f21a07078a42df86600946ffd109be',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('c8f21a07078a42df86600946ffd109be onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('e2c56db5dffb48d2b060d0f5a71096e0', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('c8f21a07078a42df86600946ffd109be onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '677ec16a743d42fcafe1d9f4a02a726f',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('677ec16a743d42fcafe1d9f4a02a726f onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0001', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('677ec16a743d42fcafe1d9f4a02a726f onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '7722712a07f4433f8e305a6dc26356ba',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('7722712a07f4433f8e305a6dc26356ba onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0002', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('7722712a07f4433f8e305a6dc26356ba onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '8aa2414e8e614d9cae14508ee3192dee',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('8aa2414e8e614d9cae14508ee3192dee onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('0f', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('8aa2414e8e614d9cae14508ee3192dee onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '0b4700c35c5346519601b7e1e06b1bbf',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('0b4700c35c5346519601b7e1e06b1bbf onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('c4', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('0b4700c35c5346519601b7e1e06b1bbf onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '980ac81e94fd43f48b9a260a65dd3adc',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('980ac81e94fd43f48b9a260a65dd3adc onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('TC000000'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('980ac81e94fd43f48b9a260a65dd3adc onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '12d8cca8b1cc4e48abf7767b5e0f3ff6',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('12d8cca8b1cc4e48abf7767b5e0f3ff6 onReadRequest');

              callback(BlenoCharacteristic.RESULT_SUCCESS, new Buffer('', 'hex'));
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('12d8cca8b1cc4e48abf7767b5e0f3ff6 onWriteRequest ' + data.toString('hex'));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '0628d1540c244cf3a6f591446c38c1f4',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'fffc3dbb92d148f1aa5289a3d9517d79',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('fffc3dbb92d148f1aa5289a3d9517d79 onReadRequest');

              var data = new Buffer(8);
              data.writeDoubleLE(123.456789, 0);

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('fffc3dbb92d148f1aa5289a3d9517d79 onWriteRequest ' + data.readDoubleLE(0));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '9e5f3adf337f4acfb54d929da486f512',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('9e5f3adf337f4acfb54d929da486f512 onReadRequest');

              var data = new Buffer(8);
              data.writeDoubleLE(999.123456, 0);

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('9e5f3adf337f4acfb54d929da486f512 onWriteRequest ' + data.readDoubleLE(0));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '676e5ff15cd7484ab98f97f3c96e6361',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('676e5ff15cd7484ab98f97f3c96e6361 onReadRequest');

              var data = new Buffer([1]);

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('676e5ff15cd7484ab98f97f3c96e6361 onWriteRequest ' + data.readDoubleLE(0));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: '9a87fdf8108b4b6f840fba9927ec4d9e',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '98a5a965efd34d16924718fd88bb8a30',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('98a5a965efd34d16924718fd88bb8a30 onReadRequest');

              var data = new Buffer('/https://twocanoes.com/bleu/config/default.plist');

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('98a5a965efd34d16924718fd88bb8a30 onWriteRequest ' + data.readDoubleLE(0));

              callback(BlenoCharacteristic.RESULT_SUCCESS);
            }
          }),
          new BlenoCharacteristic({
            uuid: '3e8501d8aa3943368908b6e79d81a050',
            properties: ['read', 'write'],
            onReadRequest: function(offset, callback) {
              console.log('3e8501d8aa3943368908b6e79d81a050 onReadRequest');

              var data = new Buffer('');

              callback(BlenoCharacteristic.RESULT_SUCCESS, data);
            },
            onWriteRequest: function(data, offset, withoutResponse, callback) {
              console.log('3e8501d8aa3943368908b6e79d81a050 onWriteRequest ' + data.readDoubleLE(0));

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
