node-bleacon
============

A node.js library for creating, discovering, and configuring iBeacons

Install
-------

    npm install bleacon

Usage
-----

    var Bleacon = require('bleacon');

__Start advertising__

"Create" an iBeacon

    var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
    var major = 0; // 0 - 65535
    var minor = 0; // 0 - 65535
    var measuredPower = -59; // -128 - 127 (measured RSSI at 1 meter)

    Bleacon.startAdvertising(uuid, major, minor, measuredPower);

__Stop advertising__

Stop your iBeacon

    Bleacon.stopAdvertising();

__Start scanning__

    var uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
    var major = 0; // 0 - 65535
    var minor = 0; // 0 - 65535

    Bleacon.startScanning([uuid], [major], [minor]);

 Examples

    Bleacon.startScanning(); // scan for any bleacons

    Bleacon.startScanning(uuid); // scan for bleacons with a particular uuid

    Bleacon.startScanning(uuid, major); // scan for bleacons with a particular uuid and major

    Bleacon.startScanning(uuid, major, minor); // scan for bleacons with a particular uuid. major, and minor

__Stop scanning__

    Bleacon.stopScanning();

__Events__

    Bleacon.on('discover', function(bleacon) {
        // ...
    });

```bleacon``` properties:
 
 * uuid
   * advertised uuid
 * major
   * advertised major
 * minor
   * advertised minor
 * measuredPower
   * advertised measured RSSI at 1 meter away
 * rssi
   * current RSSI
 * accuracy
   * +/- meters, based on measuredPower and RSSI 
 * proximity
   * current proximity ('unknown', 'immediate', 'near', or 'far')

Configuring
-----------

 * [Bleu Station](https://github.com/sandeepmistry/node-bleacon/tree/master/bleu-station)
 * [Estimote](https://github.com/sandeepmistry/node-bleacon/tree/master/estimote)

iBeacon Advertisement format
----------------------------

__Note:__ not official, determined using [noble](https://github.com/sandeepmistry/noble), and the [AirLocate](http://adcdownload.apple.com/wwdc_2013/wwdc_2013_sample_code/ios_airlocate.zip) example.

Following data is in the manufacturer data section of the advertisment data

     <company identifier (2 bytes)> <type (1 byte)> <data length (1 byte)> <uuid (16 bytes)> <major (2 bytes)> <minor (2 bytes)> <RSSI @ 1m>

Example:

    4C00 02 15 585CDE931B0142CC9A1325009BEDC65E 0000 0000 C5

 * Apple [Company Identifier](https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers) (Little Endian)
 * data type, 0x02 => iBeacon
 * data length, 0x15 = 21
 * uuid: ```585CDE931B0142CC9A1325009BEDC65E```
 * major: ```0000```
 * minor: ```0000```
 * meaured power at 1 meter: ```0xc5``` = ```-59```
