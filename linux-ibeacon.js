// Run with sudo ...
// Use with on iOS: http://adcdownload.apple.com/wwdc_2013/wwdc_2013_sample_code/ios_airlocate.zip

var exec = require('child_process').exec; 

var uuid = new Buffer('E2C56DB5DFFB48D2B060D0F5A71096E0', 'hex');
var major = 0;
var minor = 0;
var measuredPower = -59;

// EIR Length (1) + Type (1) + header (4) + uuid (16) + major (2) + minor (2) + measure (1)
var eirLength = (1 + 1) + (4 + 16 + 2 + 2 + 1);
var eirData = new Buffer(eirLength);

eirData[0] = eirLength - 1; // EIR length
eirData[1] = 0xff; // EIR Type manufacturer data

// ibeacon header
eirData[2] = 0x4c;
eirData[3] = 0x00;
eirData[4] = 0x02;
eirData[5] = 0x15;

// ibeacon uuid
for (var i = 0; i < uuid.length; i++) {
  eirData[i + 6] = uuid[i];
}

// ibeacon major
eirData.writeUInt16LE(major, 22);

// ibeacon minor
eirData.writeUInt16LE(minor, 24);

// ibeacon measure power
eirData.writeInt8(measuredPower, 26);

exec('hciconfig hci0 leadv');
exec('hcitool -i hci0 cmd 0x08 0x0008 ' + eirLength.toString(16) + ' ' + eirData.toString('hex').match(/.{1,2}/g).join(' '));
exec('hcitool -i hci0 cmd 0x08 0x000a');
