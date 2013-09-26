var exec = require('child_process').exec; 

var uuid = new Buffer('585cde931b0142cc9a1325009bedc65e', 'hex');
var major = 0x8888;
var minor = 0x9999;
var measuredPower = -59;

// EIR Length (1) + Type (1) + header (6) + uuid (16) + major (2) + minor (2) + measure (1)
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

exec('hcitool hci0 leadv');
exec('hcitool -i hci0 cmd 0x08 0x0008 ' + eirLength.toString(16) + eirData.toString('hex').match(/.{1,2}/g).join(' '));
exec('hcitool -i hci0 cmd 0x08 0x000a');
