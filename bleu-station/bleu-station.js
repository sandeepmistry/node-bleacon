var events = require('events');
var util = require('util');

var debug = require('debug')('bleu-station');

var noble = require('noble');

var DEVICE_NAME_UUID                        = '2a00';

var MANUFACTURER_NAME_UUID                  = '2a29';
var MODEL_NUMBER_UUID                       = '2a24';
var HARDWARE_REVISION_UUID                  = '2a27';
var FIRMWARE_REVISION_UUID                  = '2a26';

var IBEACON_UUID_UUID                       = 'b0702881a295a8abf734031a98a512de';
var IBEACON_MAJOR_UUID                      = 'b0702882a295a8abf734031a98a512de';
var IBEACON_MINOR_UUID                      = 'b0702883a295a8abf734031a98a512de';
var IBEACON_MEASURED_TX_POWER_UUID          = 'b0702884a295a8abf734031a98a512de';

var ADMIN_IBEACON_UUID_UUID                 = 'c8f21a07078a42df86600946ffd109be';
var ADMIN_IBEACON_MAJOR_UUID                = '677ec16a743d42fcafe1d9f4a02a726f';
var ADMIN_IBEACON_MINOR_UUID                = '7722712a07f4433f8e305a6dc26356ba';
var ADMIN_TX_POWER_UUID                     = '8aa2414e8e614d9cae14508ee3192dee';
var ADMIN_TX_POWER_CAL_UUID                 = '0b4700c35c5346519601b7e1e06b1bbf';
var ADMIN_DEVICE_NAME_UUID                  = '980ac81e94fd43f48b9a260a65dd3adc';
var ADMIN_PASSWORD_UUID                     = '12d8cca8b1cc4e48abf7767b5e0f3ff6';

var LATITUDE_UUID                           = 'fffc3dbb92d148f1aa5289a3d9517d79';
var LONGITUDE_UUID                          = '9e5f3adf337f4acfb54d929da486f512';
var VERSION_NUMBER_UUID                     = '676e5ff15cd7484ab98f97f3c96e6361';

var URL_1_UUID                              = '98a5a965efd34d16924718fd88bb8a30';
var URL_2_UUID                              = '3e8501d8aa3943368908b6e79d81a050';

var BleuStation = function(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.uuid = peripheral.uuid;
  this.name = peripheral.advertisement.localName;

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
};

util.inherits(BleuStation, events.EventEmitter);

BleuStation.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return (localName && localName.length === 8 && localName.indexOf('TC') === 0) ||
          (localName === undefined && peripheral.advertisement.manufacturerData);
};

BleuStation.discover = function(callback) {
  var startScanningOnPowerOn = function() {
    if (noble.state === 'poweredOn') {
      var onDiscover = function(peripheral) {
        if (!BleuStation.is(peripheral)) {
          return;
        }

        noble.removeListener('discover', onDiscover);

        noble.stopScanning();

        var bleuStation = new BleuStation(peripheral);

        callback(bleuStation);
      };

      noble.on('discover', onDiscover);

      noble.startScanning([], true);
    } else {
      noble.once('stateChange', startScanningOnPowerOn);
    }
  };

  startScanningOnPowerOn();
};

BleuStation.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    name: this.name
  });
};

BleuStation.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

BleuStation.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

BleuStation.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

BleuStation.prototype.discoverServicesAndCharacteristics = function(callback) {
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

BleuStation.prototype.readDataCharacteristic = function(uuid, callback) {
  this._characteristics[uuid].read(function(error, data) {
    callback(data);
  });
};

BleuStation.prototype.readStringCharacteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    if (data[0] === data.length - 1) {
      data = data.slice(1);
    }

    callback(data.toString());
  });
};

BleuStation.prototype.readUInt16Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readUInt16BE(0));
  });
};

BleuStation.prototype.readInt8Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readInt8(0));
  });
};

BleuStation.prototype.readUInt8Characteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readUInt8(0));
  });
};

BleuStation.prototype.readDoubleCharacteristic = function(uuid, callback) {
  this.readDataCharacteristic(uuid, function(data) {
    callback(data.readDoubleLE(0));
  });
};

BleuStation.prototype.writeDataCharacteristic = function(uuid, data, callback) {
  this._characteristics[uuid].write(data, false, callback);
};

BleuStation.prototype.writeStringCharacteristic = function(uuid, value, callback) {
  var valueLength = value.length;
  var data = new Buffer(valueLength + 1);
  var valueData = new Buffer(value);

  data[0] = valueLength;
  for (var i = 0; i < valueLength; i++) {
    data[i + 1] = valueData[i];
  }

  this.writeDataCharacteristic(uuid, data, callback);
};

BleuStation.prototype.writeUInt16Characteristic = function(uuid, value, callback) {
  var data = new Buffer(2);

  data.writeUInt16BE(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

BleuStation.prototype.writeInt8Characteristic = function(uuid, value, callback) {
  var data = new Buffer(1);

  data.writeInt8(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

BleuStation.prototype.writeUInt8Characteristic = function(uuid, value, callback) {
  var data = new Buffer(1);

  data.writeUInt8(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

BleuStation.prototype.writeDoubleCharacteristic = function(uuid, value, callback) {
  var data = new Buffer(8);

  data.writeDoubleLE(value, 0);

  this.writeDataCharacteristic(uuid, data, callback);
};

BleuStation.prototype.login = function(password, callback) {
  this._characteristics[ADMIN_PASSWORD_UUID].discoverDescriptors(function(error, descriptors) {
    var clientCharacteristicConfigurationDescriptor = null;

    for (var i in descriptors) {
      var descriptor = descriptors[i];

      if (descriptor.uuid === '2902') {
        clientCharacteristicConfigurationDescriptor = descriptor;
        break;
      }
    }

    clientCharacteristicConfigurationDescriptor.writeValue(new Buffer('0000', 'hex'), function(error) {
      this.writeAdminPassword(password, function(result) {
        callback(result === 0);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

BleuStation.prototype.readDeviceName = function(callback) {
  this.readStringCharacteristic(DEVICE_NAME_UUID, callback);
};

BleuStation.prototype.readManufacturerName = function(callback) {
  this.readStringCharacteristic(MANUFACTURER_NAME_UUID, callback);
};

BleuStation.prototype.readModelNumber = function(callback) {
  this.readStringCharacteristic(MODEL_NUMBER_UUID, callback);
};

BleuStation.prototype.readHardwareRevision = function(callback) {
  this.readStringCharacteristic(HARDWARE_REVISION_UUID, callback);
};

BleuStation.prototype.readFirmwareRevision = function(callback) {
  this.readStringCharacteristic(FIRMWARE_REVISION_UUID, callback);
};

BleuStation.prototype.readUuid = function(callback) {
  this.readDataCharacteristic(IBEACON_UUID_UUID, function(data) {
    callback(data.toString('hex'));
  });
};

BleuStation.prototype.readMajor = function(callback) {
  this.readUInt16Characteristic(IBEACON_MAJOR_UUID, callback);
};

BleuStation.prototype.readMinor = function(callback) {
  this.readUInt16Characteristic(IBEACON_MINOR_UUID, callback);
};

BleuStation.prototype.readTxPower = function(callback) {
  this.readUInt8Characteristic(ADMIN_TX_POWER_UUID, function(value) {
    var txPower = value * 5 + 25;

    callback(txPower);
  }.bind(this));
};

BleuStation.prototype.readMeasuredTxPower = function(callback) {
  this.readInt8Characteristic(IBEACON_MEASURED_TX_POWER_UUID, callback);
};

BleuStation.prototype.readAdminDeviceName = function(callback) {
  this.readStringCharacteristic(ADMIN_DEVICE_NAME_UUID, callback);
};

BleuStation.prototype.writeUuid = function(uuid, callback) {
  this.writeDataCharacteristic(ADMIN_IBEACON_UUID_UUID, new Buffer(uuid, 'hex'), callback);
};

BleuStation.prototype.writeMajor = function(major, callback) {
  this.writeUInt16Characteristic(ADMIN_IBEACON_MAJOR_UUID, major, callback);
};

BleuStation.prototype.writeMinor = function(minor, callback) {
  this.writeUInt16Characteristic(ADMIN_IBEACON_MINOR_UUID, minor, callback);
};

BleuStation.prototype.writeTxPower = function(txPower, callback) {
  if (txPower > 100) {
    txPower = 100;
  } else if (txPower < 25) {
    txPower = 25;
  }

  var value = Math.ceil((txPower - 25) / 5);

  this.writeUInt8Characteristic(ADMIN_TX_POWER_UUID, value, callback);
};

BleuStation.prototype.writeMeasuredTxPower = function(measureTxPower, callback) {
  this.writeInt8Characteristic(ADMIN_TX_POWER_CAL_UUID, measureTxPower, callback);
};

BleuStation.prototype.writeAdminDeviceName = function(deviceName, callback) {
  this.writeStringCharacteristic(ADMIN_DEVICE_NAME_UUID, deviceName, callback);
};

BleuStation.prototype.writeAdminPassword = function(password, callback) {
  this.writeStringCharacteristic(ADMIN_PASSWORD_UUID, password, function() {
    this.readUInt8Characteristic(ADMIN_PASSWORD_UUID, callback);
  }.bind(this));
};

BleuStation.prototype.readLatitude = function(callback) {
  this.readDoubleCharacteristic(LATITUDE_UUID, callback);
};

BleuStation.prototype.writeLatitude = function(latitude, callback) {
  this.writeDoubleCharacteristic(LATITUDE_UUID, latitude, callback);
};

BleuStation.prototype.readLongitude = function(callback) {
  this.readDoubleCharacteristic(LONGITUDE_UUID, callback);
};

BleuStation.prototype.writeLongitude = function(longitude, callback) {
  this.writeDoubleCharacteristic(LONGITUDE_UUID, longitude, callback);
};

BleuStation.prototype.readVersionNumber = function(callback) {
  this.readInt8Characteristic(VERSION_NUMBER_UUID, callback);
};

BleuStation.prototype.readURL1 = function(callback) {
  this.readStringCharacteristic(URL_1_UUID, callback);
};

BleuStation.prototype.writeURL1 = function(url1, callback) {
  this.writeStringCharacteristic(URL_1_UUID, url1, callback);
};

BleuStation.prototype.readURL2 = function(callback) {
  this.readStringCharacteristic(URL_2_UUID, callback);
};

BleuStation.prototype.writeURL2 = function(url2, callback) {
  this.writeStringCharacteristic(URL_2_UUID, url2, callback);
};

module.exports = BleuStation;
