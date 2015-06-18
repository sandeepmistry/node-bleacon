var events = require('events');
var util = require('util');

var debug = require('debug')('estimote-sticker');

var noble = require('noble');

var EstimoteSticker = function() {
  noble.on('discover', this.onDiscover.bind(this));
};

var EXPECTED_MANUFACTURER_DATA_LENGTH = 22;

util.inherits(EstimoteSticker, events.EventEmitter);


EstimoteSticker.prototype.startScanning = function() {
  debug('startScanning');

  function startScanning() {
    noble.startScanning([], true);
  }

  if (noble.state === 'poweredOn') {
    startScanning();
  } else {
    noble.once('stateChange', startScanning);
  }
};

EstimoteSticker.prototype.stopScanning = function() {
  debug('stopScanning');
  noble.stopScanning();
};

EstimoteSticker.prototype.onDiscover = function(peripheral) {
  debug('onDiscover: %s', peripheral);

  var manufacturerData = peripheral.advertisement.manufacturerData;
  var rssi = peripheral.rssi;

  debug('onDiscover: manufacturerData = %s, rssi = %d', manufacturerData ?  manufacturerData.toString('hex') : null, rssi);

  if (manufacturerData &&
      EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length &&
        manufacturerData[0] === 0x5d && manufacturerData[1] === 0x01 && // company id
        manufacturerData[2] === 0x01) { // nearable protocol version

    debug('onDiscover: ' + peripheral.uuid + ' ' + manufacturerData.toString('hex'));

    // id can be looked up: https://cloud.estimote.com/v1/stickers/<id>/info
    // response:            {"identifier":"<id>","type":"shoe","color":"blueberry","category":"shoe"}
    var id = manufacturerData.slice(3, 11).toString('hex');
    var uuid = 'd0d3fa86ca7645ec9bd96af4' + id;
    var type = (manufacturerData[11] === 0x4) ? 'SB0' : 'unknown';
    var firmware = null;

    switch (manufacturerData[12]) {
      case -127:
        firmware = 'SA1.0.0';
        break;

      case -126:
        firmware = 'SA1.0.1';
        break;

      default:
        firmware = 'unknown';
        break;
    }

    var bootloader = (manufacturerData[12] === 0x1) ? 'SB1.0.0' : 'unknown';

    var rawTemperature = (manufacturerData.readUInt16LE(13) & 0x0fff) << 4;
    var temperature = null;

    if (rawTemperature & 0x8000) {
      temperature = ((rawTemperature & 0x7fff) - 32768.0) / 256.0;
    } else {
      temperature = rawTemperature / 256.0;
    }

    var moving = (manufacturerData.readUInt8(15) & 0x40) !== 0;

    var batteryVoltage = 0;

    if ((manufacturerData.readUInt8(15) & 0x80) === 0) {
      var rawBatteryLevel = (manufacturerData.readUInt8(15) << 8) + ((manufacturerData.readUInt8(14) >> 4) & 0x3ff);

      batteryVoltage = 3.6 * rawBatteryLevel / 1023.0;
    }

    var batteryLevel = 'unknown';

    if (batteryVoltage >= 2.95) {
      batteryLevel = 'high';
    } else if (batteryVoltage < 2.95 && batteryVoltage >= 2.7) {
      batteryLevel = 'medium';
    } else if (batteryVoltage > 0.0) {
      batteryLevel = 'low';
    }

    var acceleration = {
      x: manufacturerData.readInt8(16) * 15.625,
      y: manufacturerData.readInt8(17) * 15.625,
      z: manufacturerData.readInt8(18) * 15.625
    };

    var currentMotionStateDuration = convertMotionStateDuration(manufacturerData.readUInt8(19));
    var previousMotionStateDuration = convertMotionStateDuration(manufacturerData.readUInt8(20));

    var power = [1, 2, 3, 7, 5, 6, 4, 8][manufacturerData.readUInt8(21) & 0x0f] || 'unknown';
    var firmwareState = (manufacturerData.readUInt8(21) & 0x40) ? 'app' : 'bootloader';

    var sticker = {
      id: id,
      uuid: uuid,
      type: type,
      firmware: firmware,
      bootloader: bootloader,
      temperature: temperature,
      moving: moving,
      batteryLevel: batteryLevel,
      acceleration: acceleration,
      currentMotionStateDuration: currentMotionStateDuration,
      previousMotionStateDuration: previousMotionStateDuration,
      power: power,
      firmwareState: firmwareState
    };

    this.emit('discover', sticker);
  }
};

function convertMotionStateDuration(raw) {
  var unit = (raw >> 6) & 0x03;
  var duration = (raw & 0x3f);

  if (unit === 1) {
    duration *= 60;
  } else if (unit === 2) {
    duration *= (60 * 60);
  }

  return duration;
}

module.exports = new EstimoteSticker();
