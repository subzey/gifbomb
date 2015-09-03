var Readable = require('stream').Readable;

function BitStream() {
	Readable.call(this);
	this._pendingBits = [];
	this._pendingValues = [];
}

require('util').inherits(BitStream, Readable);

BitStream.prototype.writeBits = function(value, bitLength) {
	for (var i = 0; i < bitLength; i++) {
		this._pendingBits.push((value >>> i) & 1);

		if (this._pendingBits.length === 8){
			if (!this._pendingValues.length || this._pendingValues[this._pendingValues.length - 1].length > 4095){
				this._pendingValues.push([]);
			}
			this._pendingValues[this._pendingValues.length - 1].push(
				this._pendingBits[0] +
				this._pendingBits[1] * 2 +
				this._pendingBits[2] * 4 +
				this._pendingBits[3] * 8 +
				this._pendingBits[4] * 16 +
				this._pendingBits[5] * 32 +
				this._pendingBits[6] * 64 +
				this._pendingBits[7] * 128
			);
			this._pendingBits.length = 0;
		}
	}
	if (this._readCall){
		this._read();
	}
};

BitStream.prototype.end = function(){
	if (this._pendingBits && this._pendingBits.length){
		var value = 0;
		for (var i=0; i<this._pendingBits.length; i++){
			value |= this._pendingBits[i] << i;
		}
		this._pendingValues.push(value);
	}
	this._finished = true;
	if (this._readCall){
		this._read();
	}
};

BitStream.prototype._read = function(){
	this._readCall = false;
	if (this._pendingValues.length){
		var buf = new Buffer(this._pendingValues.shift());
		this.push(buf);
		return;
	}
	if (this._finished){
		this.push(null);
		return;
	}
	this._readCall = true;
};

BitStream.prototype._finished = false;
BitStream.prototype._readCall = false;

module.exports.createBitStream = function(){
	return new BitStream();
};
