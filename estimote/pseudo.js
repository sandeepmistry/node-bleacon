var os = require('os');
var util = require('util');

var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

if (os.platform() !== 'linux') {
  console.warn('this script only supports Linux!');
}

console.log('pseudo - estimote');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingWithEIRData(
      new Buffer('0201061aff4c000215b9407f30f5f8466eaff925556b57fe6d00010002b6', 'hex'),
      new Buffer('0909657374696d6f74650e160a182eb8855fb5ddb601000200', 'hex')
    );
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart ' + error);

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'b9401000f5f8466eaff925556b57fe6d',
        characteristics: [
          new BlenoCharacteristic({
            uuid: '39e1fd0184a811e2afba0002a5d5c51b',
            properties: ['write']
          }),
          new BlenoCharacteristic({
            uuid: 'b9401002f5f8466eaff925556b57fe6d',
            properties: ['notify']
          }),
          new BlenoCharacteristic({
            uuid: 'b9401003f5f8466eaff925556b57fe6d',
            properties: ['writeWithoutResponse']
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: 'b9403000f5f8466eaff925556b57fe6d',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'b9403001f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('0200', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403002f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('0100', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403003f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('b9407f30f5f8466eaff925556b57fe6d', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403004f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('b9407f30f5f8466eaff925556b57fe6d', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403011f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('f4', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403012f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('4001', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403021f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('0000', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403031f5f8466eaff925556b57fe6d',
            properties: ['read', 'indicate'],
            value: new Buffer('00', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403032f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('00000000', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403051f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('00000000', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9403041f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('64', 'hex')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: 'b9402000f5f8466eaff925556b57fe6d',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'b9402001f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('00000000', 'hex')
          }),
          new BlenoCharacteristic({
            uuid: 'b9402002f5f8466eaff925556b57fe6d',
            properties: ['read', 'write'],
            value: new Buffer('00000000000000000000000000000000', 'hex')
          })
        ]
      }),
      new BlenoPrimaryService({
        uuid: 'b9404000f5f8466eaff925556b57fe6d',
        characteristics: [
          new BlenoCharacteristic({
            uuid: 'b9404001f5f8466eaff925556b57fe6d',
            properties: ['read'],
            value: new Buffer('A1.9')
          }),
          new BlenoCharacteristic({
            uuid: 'b9404002f5f8466eaff925556b57fe6d',
            properties: ['read'],
            value: new Buffer('D3.2')
          })
        ]
      }),
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('on -> servicesSet');
});
