var Readable = require('stream').Readable;

function BitStream() {
	Readable.call(this);
	this._pendingBits = [];
}

require('util').inherits(BitStream, Readable);

BitStream.prototype.writeBits = function(value, bitLength) {
	for (var i = 0; i < bitLength; i++) {
		this._pendingBits.push((value >>> i) & 1);

		if (this._pendingBits.length === 8){
			this.push(new Buffer([
				this._pendingBits[0] +
				this._pendingBits[1] * 2 +
				this._pendingBits[2] * 4 +
				this._pendingBits[3] * 8 +
				this._pendingBits[4] * 16 +
				this._pendingBits[5] * 32 +
				this._pendingBits[6] * 64 +
				this._pendingBits[7] * 128
			]));
			this._pendingBits.length = 0;
		}
	}
};

BitStream.prototype.end = function(){
	if (this._pendingBits && this._pendingBits.length){
		var value = 0;
		for (var i=0; i<this._pendingBits.length; i++){
			value |= this._pendingBits[i] << i;
		}
		this.push(new Buffer([value]));
	}
	this.push(null);
};

BitStream.prototype._read = function(){
	// Do nothing;
};

module.exports.createBitStream = function(){
	return new BitStream();
};
