var Transform = require('stream').Transform;

function Chunkizer(){
	Transform.call(this);
}

require('util').inherits(Chunkizer, Transform);

Chunkizer.prototype._transform = function(data, encoding, callback){
	// Very naive implementation.
	// Good for proof of concept, bad for production!
	if (this._awaiting){
		data = Buffer.concat([this._awaiting, data]);
	}
	while (data && data.length >= this._max){
		var buf = new Buffer(this._max + 1);
		buf[0] = this._max;
		data.copy(buf, 1, 0, this._max);
		if (data.length > this._max){
			data = data.slice(this._max);
		} else {
			data = null;
		}
		this.push(buf);
	}
	this._awaiting = data;
	callback();
};

Chunkizer.prototype._flush = function(callback){
	var list = [];
	if (this._awaiting){
		list.push(new Buffer([this._awaiting.length]));
		list.push(this._awaiting);
	}
	list.push(new Buffer([0]));
	this.push(Buffer.concat(list));
	callback();
	this._awaiting = null;
};

Chunkizer.prototype._awaiting = null;
Chunkizer.prototype._max = 255;

module.exports.createChunkStream = function(){
	return new Chunkizer();
};
