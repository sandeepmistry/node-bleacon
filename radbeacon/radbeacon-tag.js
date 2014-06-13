var events = require('events');
var util = require('util');

var debug = require('debug')('radbeacon-tag');

var noble = require('noble');

var SERVICE_UUID  = '248e4f81e46c4762bf3f84069c5c3f09';

var PIN_CODE_UUID = '4f82';
var COMMAND_UUID  = '4f83';
var VALUE_UUID    = '4f84';
var RESPONSE_UUID = '4f85';

var RadBeaconTag = function(peripheral) {
  this._peripheral = peripheral;
  this._services = {};
  this._characteristics = {};

  this.uuid = peripheral.uuid;
  this.name = peripheral.advertisement.localName;

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
};

util.inherits(RadBeaconTag, events.EventEmitter);

RadBeaconTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return (localName === 'RadBeacon' && peripheral.advertisement.manufacturerData);
};

RadBeaconTag.discover = function(callback) {
  var startScanningOnPowerOn = function() {
    if (noble.state === 'poweredOn') {
      var onDiscover = function(peripheral) {
        if (!RadBeaconTag.is(peripheral)) {
          return;
        }

        noble.removeListener('discover', onDiscover);

        noble.stopScanning();

        var radbeaconTag = new RadBeaconTag(peripheral);

        callback(radbeaconTag);
      };

      noble.on('discover', onDiscover);

      noble.startScanning([]);
    } else {
      noble.once('stateChange', startScanningOnPowerOn);
    }
  };

  startScanningOnPowerOn();
};

RadBeaconTag.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    name: this.name
  });
};

RadBeaconTag.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

RadBeaconTag.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

RadBeaconTag.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

RadBeaconTag.prototype.discoverServicesAndCharacteristics = function(callback) {
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

RadBeaconTag.prototype.readValue = function(command, callback) {
  this._characteristics[COMMAND_UUID].write(new Buffer([command]), false, function() {
    this._characteristics[RESPONSE_UUID].read(function(error, data) {
      callback(data);
    }.bind(this));
  }.bind(this));
};

RadBeaconTag.prototype.writeValue = function(command, value, callback) {
  this.readValue(command, function() {
    this._characteristics[VALUE_UUID].write(value, false, function() {
      this._characteristics[RESPONSE_UUID].read(function(error, data) {
        callback();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

RadBeaconTag.prototype.readName = function(callback) {
  this.readValue(0x87, function(data) {
    callback(data.toString());
  }.bind(this));
};

RadBeaconTag.prototype.readUuid = function(callback) {
  this.readValue(0x90, function(data) {
    callback(data.toString('hex'));
  }.bind(this));
};

RadBeaconTag.prototype.readMajor = function(callback) {
  this.readValue(0x91, function(data) {
    callback(data.readUInt16BE(0));
  }.bind(this));
};

RadBeaconTag.prototype.readMinor = function(callback) {
  this.readValue(0x92, function(data) {
    callback(data.readUInt16BE(0));
  }.bind(this));
};

RadBeaconTag.prototype.readMeasuredTxPower = function(callback) {
  this.readValue(0x93, function(data) {
    callback(data.readInt8(0));
  }.bind(this));
};

RadBeaconTag.prototype.readTxPower = function(callback) {
  this.readValue(0x84, function(data) {
    callback(data.readInt8(0));
  }.bind(this));
};

RadBeaconTag.prototype.readAdvertisementInterval = function(callback) {
  this.readValue(0x82, function(data) {
    callback(data.readUInt16BE(0));
  }.bind(this));
};

RadBeaconTag.prototype.readBatteryLevel = function(callback) {
  this.readValue(0xa0, function(data) {
    callback(data.readUInt8(0));
  }.bind(this));
};

RadBeaconTag.prototype.login = function(pin, callback) {
  var data = new Buffer(4);

  pin += '';

  for (var i = 0; i < data.length; i++) {
    data[i] = parseInt(pin.charAt(i), 10);
  }

  this._characteristics[PIN_CODE_UUID].write(data, false, function() {
    this._characteristics[RESPONSE_UUID].read(function(error, data) {
      callback(data.readInt8(0) === 1);
    }.bind(this));
  }.bind(this));
};

RadBeaconTag.prototype.writeName = function(name, callback) {
  this.writeValue(0x07, new Buffer(name), callback);
};

RadBeaconTag.prototype.writeUuid = function(uuid, callback) {
  this.writeValue(0x10, new Buffer(uuid, 'hex'), callback);
};

RadBeaconTag.prototype.writeMajor = function(major, callback) {
  var data = new Buffer(2);

  data.writeUInt16BE(major, 0);

  this.writeValue(0x11, data, callback);
};

RadBeaconTag.prototype.writeMinor = function(minor, callback) {
  var data = new Buffer(2);

  data.writeUInt16BE(minor, 0);

  this.writeValue(0x12, data, callback);
};

RadBeaconTag.prototype.writeMeasuredTxPower = function(measureTxPower, callback) {
  var data = new Buffer(1);

  data.writeInt8(measureTxPower, 0);

  this.writeValue(0x13, data, callback);
};

RadBeaconTag.prototype.writeAdvertisementInterval = function(advertisementInterval, callback) {
  var data = new Buffer(2);

  data.writeUInt16BE(advertisementInterval, 0);

  this.writeValue(0x02, data, callback);
};

RadBeaconTag.prototype.writeTxPower = function(txPower, callback) {
  var data = new Buffer(1);

  data.writeInt8(txPower, 0);

  this.writeValue(0x04, data, callback);
};

RadBeaconTag.prototype.writePin = function(currentpin, newpin, callback) {
  var data = new Buffer(4);

  newpin += '';

  for (var i = 0; i < data.length; i++) {
    data[i] = parseInt(newpin.charAt(i), 10);
  }

  this.login(currentpin, function() {
    this.writeValue(0x01, data, callback);
  }.bind(this));
};

module.exports = RadBeaconTag;
