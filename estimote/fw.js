var fs = require('fs');

fs.readFile('./ibeacon_rev_D2.1_app_1.6.hex', function (err, fileData) {
	// console.log(err);
	// console.log(data);

	var allData = '';

	var lines = fileData.toString().split('\n');

	for (var i in lines) {
		var line = lines[i];

		var byteCount = parseInt(line.substring(1, 3), 16);
		var address = parseInt(line.substring(3, 7), 16);
		var recordType = parseInt(line.substring(7, 9), 16);
		var data = line.substring(9, 9 + byteCount * 2);
		var checkSum = line.substring(9 + byteCount * 2, 9 + byteCount * 2 + 2);

		console.log(byteCount + ' ' + address + ' ' + recordType + ' ' + data + ' ' + checkSum);

		if (recordType === 0) {
			allData += data;
		}

		// console.log(line);
	}

	console.log(allData);
});

