

class Image {
	constructor(width, height) {
		this._width = width;
		this._height = height;
		this._buffer = new Array(height);
		for(let i = 0; i < height; i ++) {
			this._buffer[i] = new Array(width).fill(null);
		}
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	// render(x, y) {
	// 	// console.log(this._buffer[0][10] == this._buffer[10][10]);
	// 	// process.stdout.cursorTo(0, 0);
	// 	process.stdout.cursorTo(x, y);
	// 	let buffer = '';
	// 	for(let dy = 0; dy < this.height; dy ++) {
	// 		for(let dx = 0; dx < this.width; dx ++) {
	// 			buffer += this._buffer[dy][dx];
	// 		}
	// 		buffer += '\n';
	// 	}
	// 	process.stdout.write(buffer.trim());

	// }

	addLayer(image, originX, originY) {
		for(let y = originY; y < image.height; y ++) {
			const previousLine = this._buffer[y]
			const left = previousLine.substr(0, originX);
			const right = previousLine.substr(originX + image.width);
			const newLine = left + image.getRow(y - originY) + right;
		}
	}

	set(x, y, char) {
		this._buffer[y][x] = char;
		// console.log(y, x, char);
	}

	get(x, y) {

	}
}

class BlankImage extends Image {
	constructor(width, height, char) {
		super(width, height);
		this.char = char
	}

	get() {
		return this.char;
	}
}

module.exports = {
	Image,
	BlankImage
};
