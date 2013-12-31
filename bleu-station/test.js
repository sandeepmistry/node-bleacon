var async = require('async');

var BleuStation = require('./bleu-station.js');

var READ_ONLY = false;

BleuStation.discover(function(bleuStation) {
  async.series([
    function(callback) {
      bleuStation.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
      });

      console.log('found: ' + bleuStation.toString());

      console.log('connect');
      bleuStation.connect(callback);
    },
    function(callback) {
      console.log('discoverServicesAndCharacteristics');
      bleuStation.discoverServicesAndCharacteristics(callback);
    },
    function(callback) {
      if (READ_ONLY) {
        callback();
      } else {
        console.log('login');
        bleuStation.login('qwerty123', function(result) {
          console.log('\tsuccess = ' + result);

          if (result) {
            callback();
          } else {
            bleuStation.disconnect();
          }
        });
      }
    },
    function(callback) {
      console.log('readDeviceName');
      bleuStation.readDeviceName(function(deviceName) {
        console.log('\tdevice name = ' + deviceName);

        callback();
      });
    },
    function(callback) {
      console.log('readManufacturerName');
      bleuStation.readManufacturerName(function(manufacturerName) {
        console.log('\tmanufacturer name = ' + manufacturerName);
        callback();
      });
    },
    function(callback) {
      console.log('readModelNumber');
      bleuStation.readModelNumber(function(modelNumber) {
        console.log('\tmodel number = ' + modelNumber);
        callback();
      });
    },
    function(callback) {
      console.log('readHardwareRevision');
      bleuStation.readHardwareRevision(function(hardwareRevision) {
        console.log('\thardware revision = ' + hardwareRevision);
        callback();
      });
    },
    function(callback) {
      console.log('readFirmwareRevision');
      bleuStation.readFirmwareRevision(function(firmwareRevision) {
        console.log('\tfirmware revision = ' + firmwareRevision);
        callback();
      });
    },
    function(callback) {
      console.log('readUuid');
      bleuStation.readUuid(function(uuid) {
        console.log('\tuuid = ' + uuid);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeUuid');
          uuid = 'e2c56db5dffb48d2b060d0f5a71096e0';
          bleuStation.writeUuid(uuid, callback);
        }
      });
    },
    function(callback) {
      console.log('readMajor');
      bleuStation.readMajor(function(major) {
        console.log('\tmajor = ' + major + ' (0x' + major.toString(16) + ')');

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeMajor');
          major = 1;
          bleuStation.writeMajor(major, callback);
        }
      });
    },
    function(callback) {
      console.log('readMinor');
      bleuStation.readMinor(function(minor) {
        console.log('\tminor = ' + minor + ' (0x' + minor.toString(16) + ')');

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeMinor');
          minor = 2;
          bleuStation.writeMinor(minor, callback);
        }
      });
    },
    function(callback) {
      console.log('readTxPower');
      bleuStation.readTxPower(function(txPower) {
        console.log('\tTX power = ' + txPower);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeTxPower');
          txPower = 100;
          bleuStation.writeTxPower(txPower, callback);
        }
      });
    },
    function(callback) {
      console.log('readMeasuredTxPower');
      bleuStation.readMeasuredTxPower(function(measuredTxPower) {
        console.log('\tmeasured TX Power = ' + measuredTxPower);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeMeasuredTxPower');
          measuredTxPower = -60;
          bleuStation.writeMeasuredTxPower(measuredTxPower, callback);
        }
      });   
    },
    function(callback) {
      console.log('readAdminDeviceName');
      bleuStation.readAdminDeviceName(function(adminDeviceName) {
        console.log('\tadmin device name = ' + adminDeviceName);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeAdminDeviceName');
          adminDeviceName = '';
          bleuStation.writeAdminDeviceName(adminDeviceName, callback);
        }
      });
    },
    function(callback) {
      console.log('readLatitude');
      bleuStation.readLatitude(function(latitude) {
        console.log('\tlatitude = ' + latitude);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeLatitude');
          latitude = 123.456789;
          bleuStation.writeLatitude(latitude, callback);
        }
      });
    },
    function(callback) {
      console.log('readLongitude');
      bleuStation.readLongitude(function(longitude) {
        console.log('\tlongitude = ' + longitude);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeLongitude');
          longitude = 999.123456;
          bleuStation.writeLongitude(longitude, callback);
        }
      });
    },
    function(callback) {
      console.log('readVersionNumber');
      bleuStation.readVersionNumber(function(versionNumber) {
        console.log('\tversion number = ' + versionNumber);

        callback();
      });
    },
    function(callback) {
      console.log('readURL1');
      bleuStation.readURL1(function(url1) {
        console.log('\turl 1 = ' + url1);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeURL1');
          url1 = 'https://twocanoes.com/bleu/config/default.plist';
          bleuStation.writeURL1(url1, callback);
        }
      });
    },
    function(callback) {
      console.log('readURL2');
      bleuStation.readURL2(function(url2) {
        console.log('\turl 2 = ' + url2);

        if (READ_ONLY) {
          callback();
        } else {
          console.log('writeURL2');
          url2 = '';
          bleuStation.writeURL2(url2, callback);
        }
      });
    },
    function(callback) {
      console.log('disconnect');
      bleuStation.disconnect(callback);
    }
  ]);
});
