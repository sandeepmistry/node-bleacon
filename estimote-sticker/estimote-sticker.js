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

  noble.startScanning([], true);
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
        manufacturerData[0] === 0x5d &&
        manufacturerData[1] === 0x01 &&
        manufacturerData[2] === 0x01) {

    debug('onDiscover: ' + peripheral.uuid + ' ' + manufacturerData.toString('hex'));

    // id can be looked up: https://cloud.estimote.com/v1/stickers/<id>/info
    // response:            {"identifier":"<id>","type":"shoe","color":"blueberry","category":"shoe"}
    var id = manufacturerData.slice(3, 11).toString('hex');

    var temperatureBuffer = manufacturerData.slice(13, 15);
    temperatureBuffer[1] = (temperatureBuffer[1] & 0x0f);
    if (temperatureBuffer[1] & 0x08) {
      temperatureBuffer[1] |= 0xf0;
    }
    var temperature = temperatureBuffer.readInt16LE(0) / 16.0;

    var moving = (manufacturerData.readUInt8(15) & 0x40) !== 0;

    var acceleration = {
      x: manufacturerData.readInt8(16) * 16 * 0.976,
      y: manufacturerData.readInt8(17) * 16 * 0.976,
      z: manufacturerData.readInt8(18) * 16 * 0.976
    };

    var currentMotionStateDuration = manufacturerData.readUInt8(19); // s?
    var previousMotionStateDuration = manufacturerData.readUInt8(20); // s?

    var sticker = {
      id: id,
      temperature: temperature,
      moving: moving,
      acceleration: acceleration,
      currentMotionStateDuration: currentMotionStateDuration,
      previousMotionStateDuration: previousMotionStateDuration
    };

    this.emit('discover', sticker);
  }
};

module.exports = new EstimoteSticker();
