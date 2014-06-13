var async = require('async');

var RadBeaconTag = require('./radbeacon-tag');

RadBeaconTag.discover(function(radbeaconTag) {

  async.series([
    function(callback) {
      radbeaconTag.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
      });

      console.log('found: ' + radbeaconTag.toString());

      console.log('connect');
      radbeaconTag.connect(callback);
    },
    function(callback) {
      console.log('discoverServicesAndCharacteristics');
      radbeaconTag.discoverServicesAndCharacteristics(callback);
    },
    function(callback) {
      var pin = parseInt('0000', 10);

      console.log('login');
      radbeaconTag.login(pin, function(success) {
        console.log('\tsuccess = ' + success);

        callback();
      });
    },
    function(callback) {
      console.log('readName');
      radbeaconTag.readName(function(name) {
        console.log('\tname = ' + name);

        // name = 'RadBeacon Tag';
        name = 'RadBeacon Tag';

        console.log('writeName');
        radbeaconTag.writeName(name, callback);
      });
    },
    function(callback) {
      console.log('readUuid');
      radbeaconTag.readUuid(function(uuid) {
        console.log('\tuuid = ' + uuid);

        // uuid = '2f234454cf6d4a0fadf2f4911ba9ffa6';

        console.log('writeUuid');
        radbeaconTag.writeUuid(uuid, callback);
      });
    },
    function(callback) {
      console.log('readMajor');
      radbeaconTag.readMajor(function(major) {
        console.log('\tmajor = ' + major + ' (0x' + major.toString(16) + ')');

        // major = 1;

        console.log('writeMajor');
        radbeaconTag.writeMajor(major, callback);
      });
    },
    function(callback) {
      console.log('readMinor');
      radbeaconTag.readMinor(function(minor) {
        console.log('\tminor = ' + minor + ' (0x' + minor.toString(16) + ')');

        // minor = 288;

        console.log('writeMinor');
        radbeaconTag.writeMinor(minor, callback);
      });
    },
    function(callback) {
      console.log('readMeasuredTxPower');
      radbeaconTag.readMeasuredTxPower(function(measuredTxPower) {
        console.log('\tmeasured TX Power = ' + measuredTxPower);

        // measuredTxPower = -59;

        console.log('writeMeasuredTxPower');
        radbeaconTag.writeMeasuredTxPower(measuredTxPower, callback);
      });   
    },
    function(callback) {
      console.log('readTxPower');
      radbeaconTag.readTxPower(function(txPower) {
        console.log('\ttx power = ' + txPower);

        // txPower = 4;

        console.log('writeTxPower');
        radbeaconTag.writeTxPower(txPower, callback);
      });
    },
    function(callback) {
      console.log('readAdvertisementInterval');
      radbeaconTag.readAdvertisementInterval(function(advertisementInterval) {
        console.log('\tadvertisement interval = ' + advertisementInterval);

        // advertisementInterval = 100;

        console.log('writeAdvertisementInterval');
        radbeaconTag.writeAdvertisementInterval(advertisementInterval, callback);
      });
    },
    function(callback) {
      console.log('readBatteryLevel');
      radbeaconTag.readBatteryLevel(function(batteryLevel) {
        console.log('\tbattery level = ' + batteryLevel);

        callback();
      });
    },
    // function(callback) {
    //   var currentpin = 0000;
    //   var newpin = 1234;
      
    //   console.log('writePin');
    //   radbeaconTag.writePin(currentpin, newpin, function() {
    //     callback();
    //   });
    // },
    function(callback) {
      console.log('disconnect');
      radbeaconTag.disconnect(callback);
    }
  ]);
});
