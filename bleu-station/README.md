bleacon - Bleu Station
======================

Configure [Twocanoes](https://twocanoes.com) [Bleu Station](https://twocanoes.com/bleu) iBeacons.


Usage
-----

    var BleuStation = require('bleacon').BleuStation;

__Discover__

    BleuStation.discover(callback(bleuStation));

__Connect__

    bleuStation.connect(callback);

__Disconnect__

    bleuStation.disconnect(callback);

__Discover Services and Characteristics__

Run after connect.

    bleuStation.discoverServicesAndCharacteristics(callback);

__Login__

Run after discover services and characteristics prior to write operations.

    var password = 'qwert123'; // default password
    bleuStation.login(password, callback(success)); // success is a boolean

__Device Info__

    bleuStation.readDeviceName(callback(deviceName));

    bleuStation.readManufacturerName(callback(manufacturerName));

    bleuStation.readModelNumber(callback(modelNumber));

    bleuStation.readHardwareRevision(callback(hardwareRevision));

    bleuStation.readFirmwareRevision(callback(firmwareRevision));
    
__iBeacon__

    // UUID
    bleuStation.readUuid(callback(uuid));

    var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
    bleuStation.writeUuid(uuid, callback);

    // Major
    bleuStation.readMajor(callback(major));

    var major = 0x0001; // 0 - 65535
    bleuStation.writeMajor(major, callback);

    // Minor
    bleuStation.readMinor(callback(minor));

    var minor = 0x0002; // 0 - 65535
    bleuStation.writeMinor(minor, callback);

    // Measured power
    bleuStation.readMeasuredTxPower(callback(measuredTxPower));

    var measuredTxPower = -60; // -128 - 127
    bleuStation.writeMeasuredTxPower(measuredTxPower, callback);

__Admin__

    // TX Power
    bleuStation.readTxPower(callback(txPower));

    var txPower = 100; // 25 - 100
    bleuStation.writeTxPower(txPower, callback);

    // Admin. device name
    bleuStation.readAdminDeviceName(callback(adminDeviceName));

    var adminDeviceName = 'ADM';
    bleuStation.writeAdminDeviceName(adminDeviceName, callback);

    // Admin. password (used for login)
    var adminPassword = 'qwerty123';
    bleuStation.writeAdminPassword(adminPassword, callback);

    // Version (config)
    bleuStation.readVersionNumber(callback(versionNumber));

__Other__

    // latitude
    bleuStation.readLatitude(callback(latitude));

    var latitude = 123.456789;
    bleuStation.writeLatitude(latitude, callback);

    // longitude
    bleuStation.readLongitude(callback(tlongitude));

    var longitude = 999.123456;
    bleuStation.writeLongitude(longitude, callback);

    // URL 1
    bleuStation.readURL1(callback(url1));

    var url1 = 'https://twocanoes.com/bleu/config/default.plist';
    bleuStation.writeURL1(url1, callback);

    // URL 2
    bleuStation.readURL2(callback(url1));

    var url2 = '';
    bleuStation.writeURL2(url2, callback);

Events 
------

__Disconnect__

    bleuStation.on('disconnect', callback);
