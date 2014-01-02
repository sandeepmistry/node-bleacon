bleacon - Estimote
==================

Configure [Estimote](http://estimote.com) iBeacons.


Usage
-----

    var Estimote = require('bleacon').Estimote;

__Discover__

    Estimote.discover(callback(estimote));

__Connect__

    estimote.connect(callback);

__Disconnect__

    estimote.disconnect(callback);

__Discover Services and Characteristics__

Run after connect.

    estimote.discoverServicesAndCharacteristics(callback);

__Pair__

Run after discover services and characteristics prior to write operations.

    estimote.pair(callback);

__Device Info__

    estimote.readDeviceName(callback(deviceName));

    var deviceName = 'estimote';
    estimote.writeDeviceName(deviceName, callback);

    estimote.readBatteryLevel(callback(batteryLevel));

    estimote.readFirmwareRevision(callback(firmwareRevision));

    estimote.readHardwareRevision(callback(hardwareRevision));

__iBeacon__

    // UUID 1 & 2
    var uuid = 'b9407f30f5f8466eaff925556b57fe6d';

    estimote.readUuid1(callback(uuid1));
    estimote.readUuid2(callback(uuid2));

    estimote.writeUuid1(uuid, callback);
    estimote.writeUuid2(uuid, callback);

    // Major
    estimote.readMajor(callback(major));

    var major = 0x0001; // 0 - 65535
    estimote.writeMajor(major, callback);

    // Minor
    estimote.readMinor(callback(minor));

    var minor = 0x0002; // 0 - 65535
    estimote.writeMinor(minor, callback);

__Other__

    // Signal Strength (dBm)
    estimote.readSignalStrength(callback(signalStrength));

    // Advertisement Interval
    estimote.readAdvertisementInterval(callback(advertisementInterval));

    var advertisementInterval = 200; // 50 - 2000 ms
    estimote.writeAdvertisementInterval(advertisementInterval, callback);

    // Power Level
    estimote.readPowerLevel(callback(powerLevel));

    var powerLevel = 7; // 1 - 7
    estimote.writePowerLevel(powerLevel, callback);

Events 
------

__Disconnect__

    estimote.on('disconnect', callback);
