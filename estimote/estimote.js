var crypto = require('crypto');

var bignum = require('bignum');
var debug = require('debug')('estimote');

var NobleDevice = require('noble-device');

var GENERIC_ACCESS_SERVICE_UUID     = '1800';
var DEVICE_NAME_UUID                = '2a00';

var ESTIMOTE_SERVICE_UUID           = 'b9403000f5f8466eaff925556b57fe6d';
var MAJOR_UUID                      = 'b9403001f5f8466eaff925556b57fe6d';
var MINOR_UUID                      = 'b9403002f5f8466eaff925556b57fe6d';
var UUID_1_UUID                     = 'b9403003f5f8466eaff925556b57fe6d';
var UUID_2_UUID                     = 'b9403004f5f8466eaff925556b57fe6d';
var POWER_LEVEL_UUID                = 'b9403011f5f8466eaff925556b57fe6d';
var ADVERTISEMENT_INTERVAL_UUID     = 'b9403012f5f8466eaff925556b57fe6d';
var TEMPERATURE_UUID                = 'b9403021f5f8466eaff925556b57fe6d';
var MOTION_UUID                     = 'b9403031f5f8466eaff925556b57fe6d';
var SERVICE_2_09_UUID               = 'b9403032f5f8466eaff925556b57fe6d';
var SERVICE_2_10_UUID               = 'b9403051f5f8466eaff925556b57fe6d';
var BATTERY_LEVEL_UUID              = 'b9403041f5f8466eaff925556b57fe6d';
var SERVICE_CONFIGURATION_UUID      = 'b9403051f5f8466eaff925556b57fe6d';
var EDDYSTONE_UID_NAMESPACE_UUID    = 'b9403071f5f8466eaff925556b57fe6d';
var EDDYSTONE_UID_INSTANCE_UUID     = 'b9403072f5f8466eaff925556b57fe6d';
var EDDYSTONE_URL_UUID              = 'b9403073f5f8466eaff925556b57fe6d';

var AUTH_SERVICE_UUID               = 'b9402000f5f8466eaff925556b57fe6d';
var AUTH_SERVICE_1_UUID             = 'b9402001f5f8466eaff925556b57fe6d'; // auth seed
var AUTH_SERVICE_2_UUID             = 'b9402002f5f8466eaff925556b57fe6d'; // auth vector

var VERSION_SERVICE_UUID            = 'b9404000f5f8466eaff925556b57fe6d';
var FIRMWARE_VERSION_UUID           = 'b9404001f5f8466eaff925556b57fe6d';
var HARDWARE_VERSION_UUID           = 'b9404002f5f8466eaff925556b57fe6d';

var Estimote = function(peripheral) {
  NobleDevice.call(this, peripheral);

  this.manufacturerData = (peripheral.advertisement.manufacturerData ? peripheral.advertisement.manufacturerData.toString('hex') : null);

  var serviceData = peripheral.advertisement.serviceData[0].data;

  this.address = serviceData.slice(0, 6).toString('hex').match(/.{1,2}/g).reverse().join(':');
  this.addressData = new Buffer(this.address.split(':').join(''), 'hex');

  this.measuredPower = serviceData.readInt8(6);
  this.major = serviceData.readUInt16LE(7);
  this.minor = serviceData.readUInt16LE(9);

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
  this._onMotionDataBinded = this.onMotionData.bind(this);
};

NobleDevice.Util.inherits(Estimote, NobleDevice);

Estimote.SCAN_DUPLICATES = true;

Estimote.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return ( (localName === 'estimote' || localName === 'EST') && // original || "new" name
            peripheral.advertisement.serviceData !== undefined &&
            peripheral.advertisement.serviceData.length &&
            peripheral.advertisement.serviceData[0].uuid === '180a');
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


Estimote.prototype.pair = function(callback) {
  var base = 5;
  var exp = Math.round(Math.random() * 0xffffffff);
  var mod = 0xfffffffb;

  var sec = bignum(base).powm(exp, mod);

  this.writeAuthService1(sec, function(error) {
    if (error) {
      return callback(error);
    }

    this.readAuthService1(function(error, authService1Value) {
      if (error) {
        return callback(error);
      }


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
      var fixedKeyHexString = (this._peripheral.advertisement.localName === 'EST') ?
                                'c54fc29163e4457b8a9ac9868e1b3a9a' : // "new" fixed key (v3)
                                'ff8af207013625c2d810097f20d3050f';   // original fixed key

      var key = new Buffer(fixedKeyHexString, 'hex');
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

      this.writeAuthService2(authService2Data, function(error) {
        callback(error);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};


Estimote.prototype.writeDeviceName = function(deviceName, callback) {
  this.writeStringCharacteristic(GENERIC_ACCESS_SERVICE_UUID, DEVICE_NAME_UUID, deviceName, callback);
};

Estimote.prototype.readMajor = function(callback) {
  this.readUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, MAJOR_UUID, callback);
};

Estimote.prototype.writeMajor = function(major, callback) {
  this.writeUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, MAJOR_UUID, major, callback);
};

Estimote.prototype.readMinor = function(callback) {
  this.readUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, MINOR_UUID, callback);
};

Estimote.prototype.writeMinor = function(minor, callback) {
  this.writeUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, MINOR_UUID, minor, callback);
};

Estimote.prototype.readUuid1 = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, UUID_1_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.toString('hex'));
  });
};

Estimote.prototype.writeUuid1 = function(uuid1, callback) {
  this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, UUID_1_UUID, new Buffer(uuid1, 'hex'), callback);
};

Estimote.prototype.readUuid2 = function(callback) {
 this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, UUID_2_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.toString('hex'));
  });
};

Estimote.prototype.writeUuid2 = function(uuid2, callback) {
  this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, UUID_2_UUID, new Buffer(uuid2, 'hex'), callback);
};

Estimote.prototype.readPowerLevel = function(callback) {
  this.readUInt8Characteristic(ESTIMOTE_SERVICE_UUID, POWER_LEVEL_UUID, function(error, rawLevel) {
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

    if (error) {
      return callback(error);
    }

    var powerLevel = POWER_LEVEL_MAPPER['' + rawLevel];

    if (powerLevel === undefined) {
      powerLevel = 'unknown';
    }

    callback(error, powerLevel, rawLevel);
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

  this.writeUInt8Characteristic(ESTIMOTE_SERVICE_UUID, POWER_LEVEL_UUID, rawLevel, callback);
};

Estimote.prototype.readAdvertisementInterval = function(callback) {
  // 50   -> 0x5000 -> 80
  // 200  -> 0x4001 -> 320
  // 2000 -> 0x800c -> 3200

  this.readUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, ADVERTISEMENT_INTERVAL_UUID, function(error, rawAdvertisementInterval) {
    if (error) {
      return callback(error);
    }

    var advertisementInterval = (rawAdvertisementInterval / 8) * 5;

    callback(null, advertisementInterval);
  }.bind(this));
};

Estimote.prototype.writeAdvertisementInterval = function(advertisementInterval, callback) {
  var rawAdvertisementInterval = (advertisementInterval / 5) * 8;

  this.writeUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, ADVERTISEMENT_INTERVAL_UUID, rawAdvertisementInterval, callback);
};

Estimote.prototype.readTemperature = function(callback) {
  this.writeUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, TEMPERATURE_UUID, 0xffff, function(error) {
    if (error) {
      return callback(error);
    }

    this.readUInt16LECharacteristic(ESTIMOTE_SERVICE_UUID, TEMPERATURE_UUID, function(error, temperature) {
      if (error) {
        return callback(error);
      }

      callback(null, temperature / 256.0);
    });
  }.bind(this));
};

Estimote.prototype.subscribeMotion = function(callback) {
  this.notifyCharacteristic(ESTIMOTE_SERVICE_UUID, MOTION_UUID, true, this._onMotionDataBinded, callback);
};

Estimote.prototype.unsubscribeMotion = function(callback) {
  this.notifyCharacteristic(ESTIMOTE_SERVICE_UUID, MOTION_UUID, false, this._onMotionDataBinded, callback);
};

Estimote.prototype.onMotionData = function(data) {
  this.emit('motionStateChange', data.readUInt8(0) ? true : false);
};

Estimote.prototype.readService2_9 = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, SERVICE_2_09_UUID, callback);
};

Estimote.prototype.readService2_10 = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, SERVICE_2_10_UUID, callback);
};

Estimote.prototype.readBatteryLevel = function(callback) {
  this.readUInt8Characteristic(ESTIMOTE_SERVICE_UUID, BATTERY_LEVEL_UUID, callback);
};

var SERVICE_CONFIGURATION_MAPPER = ['default', 'eddystone-uid', 'eddystone-url'];

Estimote.prototype.readServiceConfiguration = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, SERVICE_CONFIGURATION_UUID, function(error, value) {
    if (error) {
      return callback(error);
    }

    callback(null, SERVICE_CONFIGURATION_MAPPER[value[3] & 0x03]);
  }.bind(this));
};

Estimote.prototype.writeServiceConfiguration = function(serviceConfig, callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, SERVICE_CONFIGURATION_UUID, function(error, value) {
    if (error) {
      return callback(error);
    }

    value[3] &= 0xfc;
    value[3] |= SERVICE_CONFIGURATION_MAPPER.indexOf(serviceConfig);

    this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, SERVICE_CONFIGURATION_UUID, value, callback);
  }.bind(this));
};

Estimote.prototype.readEddystoneUidNamespace = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_UID_NAMESPACE_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.toString('hex'));
  });
};

Estimote.prototype.writeEddystoneUidNamespace = function(uidNamespace, callback) {
  this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_UID_NAMESPACE_UUID, new Buffer(uidNamespace, 'hex'), callback);
};

Estimote.prototype.readEddystoneUidInstance = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_UID_INSTANCE_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    callback(null, data.toString('hex'));
  });
};

Estimote.prototype.writeEddystoneUidInstance = function(uidInstance, callback) {
  this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_UID_INSTANCE_UUID, new Buffer(uidInstance, 'hex'), callback);
};

Estimote.prototype.readEddystoneUrl = function(callback) {
  this.readDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_URL_UUID, callback);
};

Estimote.prototype.writeEddystoneUrl = function(url, callback) {
  this.writeDataCharacteristic(ESTIMOTE_SERVICE_UUID, EDDYSTONE_URL_UUID, url, callback);
};

Estimote.prototype.readAuthService1 = function(callback) {
  this.readUInt32LECharacteristic(AUTH_SERVICE_UUID, AUTH_SERVICE_1_UUID, callback);
};

Estimote.prototype.writeAuthService1 = function(value, callback) {
  this.writeUInt32LECharacteristic(AUTH_SERVICE_UUID, AUTH_SERVICE_1_UUID, value, callback);
};

Estimote.prototype.readAuthService2 = function(callback) {
  this.readDataCharacteristic(AUTH_SERVICE_UUID, AUTH_SERVICE_2_UUID, callback);
};

Estimote.prototype.writeAuthService2 = function(data, callback) {
  this.writeDataCharacteristic(AUTH_SERVICE_UUID, AUTH_SERVICE_2_UUID, data, callback);
};

Estimote.prototype.readFirmwareVersion = function(callback) {
  this.readStringCharacteristic(VERSION_SERVICE_UUID, FIRMWARE_VERSION_UUID, callback);
};

Estimote.prototype.readHardwareVersion = function(callback) {
  this.readStringCharacteristic(VERSION_SERVICE_UUID, HARDWARE_VERSION_UUID, callback);
};

module.exports = Estimote;
