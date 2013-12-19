var events = require('events');
var crypto = require('crypto');
var util = require('util');

var bignum = require('bignum');
var debug = require('debug')('estimote');

var noble = require('noble');

var DEVICE_NAME_UUID                = '2a00';

var MAJOR_UUID                      = 'b9403001f5f8466eaff925556b57fe6d';
var MINOR_UUID                      = 'b9403002f5f8466eaff925556b57fe6d';
var UUID_1_UUID                     = 'b9403003f5f8466eaff925556b57fe6d';
var UUID_2_UUID                     = 'b9403004f5f8466eaff925556b57fe6d';
var SIGNAL_STRENGTH_UUID            = 'b9403011f5f8466eaff925556b57fe6d';
var ADVERTISEMENT_INTERVAL_UUID     = 'b9403012f5f8466eaff925556b57fe6d';
var SERVICE_2_07_UUID               = 'b9403021f5f8466eaff925556b57fe6d';
var POWER_LEVEL_UUID                = 'b9403031f5f8466eaff925556b57fe6d';
var SERVICE_2_09_UUID               = 'b9403032f5f8466eaff925556b57fe6d';
var SERVICE_2_10_UUID               = 'b9403051f5f8466eaff925556b57fe6d';
var BATTERY_LEVEL_UUID              = 'b9403041f5f8466eaff925556b57fe6d';

var AUTH_SERVICE_1_UUID             = 'b9402001f5f8466eaff925556b57fe6d';
var AUTH_SERVICE_2_UUID             = 'b9402002f5f8466eaff925556b57fe6d';

var FIRMWARE_VERSION_UUID           = 'b9404001f5f8466eaff925556b57fe6d';
var HARDWARE_VERSION_UUID           = 'b9404002f5f8466eaff925556b57fe6d';

var Estimote = function(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.uuid = peripheral.uuid;
  this.manufacturerData = peripheral.advertisement.manufacturerData.toString('hex');

  var serviceData = peripheral.advertisement.serviceData;

  this.address = serviceData.slice(2, 8).toString('hex').match(/.{1,2}/g).reverse().join(':');
  this.addressData = new Buffer(this.address.split(':').join(''), 'hex');

  this.measuredPower = serviceData.readInt8(8);
  this.major = serviceData.readUInt16LE(9);
  this.minor = serviceData.readUInt16LE(11);

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
};

util.inherits(Estimote, events.EventEmitter);

Estimote.is = function(peripheral) {
  return (peripheral.advertisement.localName === 'estimote' && 
            peripheral.advertisement.manufacturerData !== undefined &&
            peripheral.advertisement.serviceData !== undefined);
};

Estimote.discover = function(callback) {
  var startScanningOnPowerOn = function() {
    if (noble.state === 'poweredOn') {
      var onDiscover = function(peripheral) {
        if (!Estimote.is(peripheral)) {
          return;
        }

        noble.removeListener('discover', onDiscover);

        noble.stopScanning();

        var estimote = new Estimote(peripheral);

        callback(estimote);
      };

      noble.on('discover', onDiscover);

      noble.startScanning([], true);
    } else {
      noble.once('stateChange', startScanningOnPowerOn);
    }
  };

  startScanningOnPowerOn();
};

Estimote.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    address: this.address,
    manufacturerData: this.manufacturerData,
    major: this.major,
    minor: this.minor,
    measuredPower: this.measuredPower
  });
};

Estimote.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

Estimote.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

Estimote.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

Estimote.prototype.discoverServicesAndCharacteristics = function(callback) {
  this._peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
    if (error === null) {
      for (var i in services) {
        var service = services[i];
        this._services[service.uuid] = service;
      }

      for (var j in characteristics) {
        var characteristic = characteristics[j];

        this._characteristics[characteristic.uuid] = characteristic;
      }
    }

    callback(error);
  }.bind(this));
};

Estimote.prototype.readDataCharacteristic = function(uuid, callback) {
  this._characteristics[uuid].read(function(error, data) {
    callback(data);
  });
};

Estimote.prototype.readInt8Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readInt8(0));
  });
};

Estimote.prototype.readUInt8Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readUInt8(0));
  });
};

Estimote.prototype.readUInt16Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readUInt16LE(0));
  });
};

Estimote.prototype.readUInt32Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readUInt32LE(0));
  });
};

Estimote.prototype.readStringCharacteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.toString());
  });
};

Estimote.prototype.writeDataCharacteristic = function(uuid, data, callback) {
  this._characteristics[uuid].write(data, false, callback);
};

Estimote.prototype.writeInt8Characteristic = function(uuid, value, callback) {
  var data = new Buffer(1);

  data.writeInt8(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

Estimote.prototype.writeUInt8Characteristic = function(uuid, value, callback) {
  var data = new Buffer(1);

  data.writeUInt8(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

Estimote.prototype.writeUInt16Characteristic = function(uuid, value, callback) {
  var data = new Buffer(2);

  data.writeUInt16LE(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

Estimote.prototype.writeUInt32Characteristic = function(uuid, value, callback) {
  var data = new Buffer(4);

  data.writeUInt32LE(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

Estimote.prototype.writeStringCharacteristic = function(uuid, value, callback) {
  this.writeDataCharacteristic(uuid, new Buffer(value), callback);
};

Estimote.prototype.pair = function(callback) {
  var base = 5;
  var exp = Math.round(Math.random() * 0xffffffff);
  var mod = 0xfffffffb;

  var sec = bignum(base).powm(exp, mod);

  this.writeAuthService1(sec, function() {
    this.readAuthService1(function(authService1Value) {
      sec = bignum(authService1Value).powm(exp, mod);

      var authService2Data = new Buffer(16);

      // fill in authService2Data with address
      authService2Data[0] = this.addressData[5];
      authService2Data[1] = this.addressData[4];
      authService2Data[2] = this.addressData[3];
      authService2Data[3] = this.addressData[2];
      authService2Data[4] = this.addressData[1];
      authService2Data[5] = this.addressData[0];
      authService2Data[6] = this.addressData[3];
      authService2Data[7] = this.addressData[4];
      authService2Data[8] = this.addressData[5];
      authService2Data[9] = this.addressData[0];
      authService2Data[10] = this.addressData[1];
      authService2Data[11] = this.addressData[2];
      authService2Data[12] = this.addressData[1];
      authService2Data[13] = this.addressData[3];
      authService2Data[14] = this.addressData[2];
      authService2Data[15] = this.addressData[4];

      // encrypt
      var key = new Buffer('ff8af207013625c2d810097f20d3050f', 'hex');
      var iv = new Buffer('00000000000000000000000000000000', 'hex');

      var cipher = crypto.createCipheriv('aes128', key, iv);

      cipher.setAutoPadding(false);
      authService2Data = cipher.update(authService2Data);

      // fill in key with sec
      var secData = new Buffer(4);
      secData.writeUInt32BE(sec, 0);

      key[0] = secData[3];
      key[1] = secData[2];
      key[2] = secData[1];
      key[3] = secData[0];
      key[4] = secData[0];
      key[5] = secData[1];
      key[6] = secData[2];
      key[7] = secData[3];
      key[8] = secData[3];
      key[9] = secData[0];
      key[10] = secData[2];
      key[11] = secData[1];
      key[12] = secData[0];
      key[13] = secData[3];
      key[14] = secData[1];
      key[15] = secData[2];

      // decrypt
      var decipher = crypto.createDecipheriv('aes128', key, iv);
      
      decipher.setAutoPadding(false);
      authService2Data = decipher.update(authService2Data);

      this.writeAuthService2(authService2Data, function() {
        callback();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Estimote.prototype.readDeviceName = function(callback) {
  this.readStringCharacteristic(DEVICE_NAME_UUID, callback);
};

Estimote.prototype.writeDeviceName = function(deviceName, callback) {
  this.writeStringCharacteristic(DEVICE_NAME_UUID, deviceName, callback);
};

Estimote.prototype.readMajor = function(callback) {
  this.readUInt16Characteristic(MAJOR_UUID, callback);
};

Estimote.prototype.writeMajor = function(major, callback) {
  this.writeUInt16Characteristic(MAJOR_UUID, major, callback);
};

Estimote.prototype.readMinor = function(callback) {
  this.readUInt16Characteristic(MINOR_UUID, callback);
};

Estimote.prototype.writeMinor = function(minor, callback) {
  this.writeUInt16Characteristic(MINOR_UUID, minor, callback);
};

Estimote.prototype.readUuid1 = function(callback) {
  this.readDataCharacteristic(UUID_1_UUID, function(data) {
    callback(data.toString('hex'));
  });
};

Estimote.prototype.writeUuid1 = function(uuid1, callback) {
  this.writeDataCharacteristic(UUID_1_UUID, new Buffer(uuid1, 'hex'), callback);
};

Estimote.prototype.readUuid2 = function(callback) {
 this.readDataCharacteristic(UUID_2_UUID, function(data) {
    callback(data.toString('hex'));
  });
};

Estimote.prototype.writeUuid2 = function(uuid2, callback) {
  this.writeDataCharacteristic(UUID_2_UUID, new Buffer(uuid2, 'hex'), callback);
};

Estimote.prototype.readSignalStrength = function(callback) {
  this.readInt8Characteristic(SIGNAL_STRENGTH_UUID, callback);
};

Estimote.prototype.readAdvertisementInterval = function(callback) {
  // 50   -> 0x5000 -> 80
  // 200  -> 0x4001 -> 320
  // 2000 -> 0x800c -> 3200

  this.readUInt16Characteristic(ADVERTISEMENT_INTERVAL_UUID, function(rawAdvertisementInterval) {
    var advertisementInterval = (rawAdvertisementInterval / 8) * 5;

    callback(advertisementInterval);
  }.bind(this));
};

Estimote.prototype.writeAdvertisementInterval = function(advertisementInterval, callback) {
  var rawAdvertisementInterval = (advertisementInterval / 5) * 8;

  this.writeUInt16Characteristic(ADVERTISEMENT_INTERVAL_UUID, rawAdvertisementInterval, callback);
};

Estimote.prototype.readService2_7 = function(callback) {
  this.readDataCharacteristic(SERVICE_2_07_UUID, callback);
};

Estimote.prototype.readPowerLevel = function(callback) {
  this.readInt8Characteristic(POWER_LEVEL_UUID, function(rawLevel) {
    var POWER_LEVEL_MAPPER = {
      '-30': 1,
      '-20': 2,
      '-16': 3,
      '-12': 4,
       '-8': 5,
       '-4': 6,
        '0': 7,
        '4': 8 
    };

    var powerLevel = POWER_LEVEL_MAPPER['' + rawLevel];

    if (powerLevel === undefined) {
      powerLevel = 'unknown';
    }

    callback(powerLevel);
  }.bind(this));
};

Estimote.prototype.writePowerLevel = function(powerLevel, callback) {
  if (powerLevel < 1) {
    powerLevel = 1;
  } else if (powerLevel > 8) {
    powerLevel = 8;
  }

  var POWER_LEVEL_MAPPER = {
    1: -30,
    2: -20,
    3: -16,
    4: -12,
    5:  -8,
    6:  -4,
    7:   0,
    8:   4
  };

  var rawLevel = POWER_LEVEL_MAPPER[powerLevel];

  this.writeInt8Characteristic(POWER_LEVEL_UUID, rawLevel, callback);
};

Estimote.prototype.readService2_9 = function(callback) {
  this.readDataCharacteristic(SERVICE_2_09_UUID, callback);
};

Estimote.prototype.readService2_10 = function(callback) {
  this.readDataCharacteristic(SERVICE_2_10_UUID, callback);
};

Estimote.prototype.readBatteryLevel = function(callback) {
  this.readUInt8Characteristic(BATTERY_LEVEL_UUID, callback);
};

Estimote.prototype.readAuthService1 = function(callback) {
  this.readUInt32Characteristic(AUTH_SERVICE_1_UUID, callback);
};

Estimote.prototype.writeAuthService1 = function(value, callback) {
  this.writeUInt32Characteristic(AUTH_SERVICE_1_UUID, value, callback);
};

Estimote.prototype.readAuthService2 = function(callback) {
  this.readDataCharacteristic(AUTH_SERVICE_2_UUID, callback);
};

Estimote.prototype.writeAuthService2 = function(data, callback) {
  this.writeDataCharacteristic(AUTH_SERVICE_2_UUID, data, callback);
};

Estimote.prototype.readFirmwareVersion = function(callback) {
  this.readStringCharacteristic(FIRMWARE_VERSION_UUID, callback);
};

Estimote.prototype.readHardwareVersion = function(callback) {
  this.readStringCharacteristic(HARDWARE_VERSION_UUID, callback);
};

module.exports = Estimote;
