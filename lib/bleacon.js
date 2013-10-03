var events = require('events');
var util = require('util');

var debug = require('debug')('bleacon');

var noble = require('noble');

var EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
var EXPECTED_MANUFACTURER_DATA_HEADER = 0x4c000215;

var Bleacon = function() {
  this._uuid = null;
  this._major = null;
  this._minor = null;

  noble.on('discover', this.onDiscover.bind(this));
};

util.inherits(Bleacon, events.EventEmitter);

Bleacon.prototype.startScanning = function(uuid, major, minor) {
  debug('startScanning: uuid = %s, major = %s, minor = %s', uuid, major, minor);

  this._uuid = uuid;
  this._major = major;
  this._minor = minor;

  if (noble.state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.on('stateChange', function() {
      noble.startScanning([], true);
    });
  }
};

Bleacon.prototype.stopScanning = function() {
  debug('stopScanning');
  noble.stopScanning();
};

Bleacon.prototype.onDiscover = function(peripheral) {
  debug('onDiscover: %s', peripheral);

  var manufacturerData = peripheral.advertisement.manufacturerData;
  var rssi = peripheral.rssi;

  debug('onDiscover: manufacturerData = %s, rssi = %d', manufacturerData ?  manufacturerData.toString('hex') : null, rssi);

  if (manufacturerData && 
      EXPECTED_MANUFACTURER_DATA_LENGTH === manufacturerData.length &&
      EXPECTED_MANUFACTURER_DATA_HEADER === manufacturerData.readUInt32BE(0)) {

    var uuid = manufacturerData.slice(4, 20).toString('hex');
    var major = manufacturerData.readUInt16LE(20);
    var minor = manufacturerData.readUInt16LE(22);
    var measuredPower = manufacturerData.readInt8(24);

    debug('onDiscover: uuid = %s, major = %d, minor = %d, measuredPower = %d', uuid, major, minor, measuredPower);

    if ((!this._uuid || this._uuid === uuid) &&
        (!this._major || this._major === major) &&
        (!this._minor || this._minor === minor)) {

      var accuracy = Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));
      var proximity = null;

      if (accuracy < 0) {
        proximity = 'unknown';
      } else if (accuracy < 0.5) {
        proximity = 'immediate';
      } else if (accuracy < 4.0) {
        proximity = 'near';
      } else {
        proximity = 'far';
      }

      var bleacon = {
        uuid: uuid,
        major: major,
        minor: minor,
        measuredPower: measuredPower,
        rssi: rssi,
        accuracy: accuracy,
        proximity: proximity
      };

      debug('onDiscover: bleacon = %s', JSON.stringify(bleacon));

      this.emit('discover', bleacon);
    }
  }
};

module.exports = Bleacon;
