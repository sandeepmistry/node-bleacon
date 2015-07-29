bleacon - Estimote
==================

Configure [Estimote](http://estimote.com) iBeacons.


Usage
-----

```javascript
var Estimote = require('bleacon').Estimote;
```

__Discover__

```javascript
Estimote.discover(callback(estimote));

Estimote.discoverAll(callback(estimote));
```

__Connect an Setup__

Run after discover.

```javascript
estimote.connectAndSetUp(callback(error));
```

__Disconnect__

```javascript
estimote.disconnect(callback(error));
```


__Pair__

Run after ```connectAndSetUp``` prior to write operations.

```javascript
estimote.pair(callback(error));
```

__Device Info__

```javascript
estimote.readDeviceName(callback(error, deviceName));

var deviceName = 'estimote';
estimote.writeDeviceName(deviceName, callback(error));

estimote.readBatteryLevel(callback(error, batteryLevel));

estimote.readFirmwareRevision(callback(error, firmwareRevision));

estimote.readHardwareRevision(callback(error, hardwareRevision));
```

__iBeacon__

```javascript
// UUID 1 & 2
var uuid = 'b9407f30f5f8466eaff925556b57fe6d';

estimote.readUuid1(callback(error, uuid1));
estimote.readUuid2(callback(error, uuid2));

estimote.writeUuid1(uuid, callback(error));
estimote.writeUuid2(uuid, callback(error));

// Major
estimote.readMajor(callback(error, major));

var major = 0x0001; // 0 - 65535
estimote.writeMajor(major, callback(error));

// Minor
estimote.readMinor(callback(error, minor));

var minor = 0x0002; // 0 - 65535
estimote.writeMinor(minor, callback(error));
```

__Other__

```javascript
// Advertisement Interval
estimote.readAdvertisementInterval(callback(error, advertisementInterval));

var advertisementInterval = 200; // 50 - 2000 ms
estimote.writeAdvertisementInterval(advertisementInterval, callback(error));

// Power Level
estimote.readPowerLevel(callback(error, powerLevel, dBm));

var powerLevel = 7; // 1 - 7
estimote.writePowerLevel(powerLevel, callback(error));
```

__Sensors__

```javascript
estimote.readTemperature(callback(error, temperature));

estimote.subscribeMotion(callback(error));
estimote.unsubscribeMotion(callback(error));
estimote.on('motionStateChange', callback(isMoving));
```

Events
------

__Disconnect__

```javascript
estimote.on('disconnect', callback);
```
