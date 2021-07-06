const width = process.stdout.getWindowSize()[0];

module.exports.fromBuckets = fromBuckets;
function fromBuckets(buckets) {
	return function(num) {
		let char;
		for(const [min, character] of buckets) {
			if(num > min) char = character;
		}
		return char;
	}
}

module.exports.fromDistribution = fromDistribution;
function fromDistribution(min, max, chars) {
	const n = chars.length;
	
	const bucketMins = chars.map((_, i) => {
		if(i === 0) return -Infinity
		return ((i / n) * (max - min)) + min
	});

	const buckets = bucketMins.map((v, i) => {
		return [v, chars[i]]
	});

	const mapping = fromBuckets(buckets);
	return mapping;
}

module.exports.printMapping = printMapping;
function printMapping(mapping, min, max) {
	let buffer = '';
	for(let i = 0; i < width; i ++) {
		const val = ((i / width) * (max - min)) + min;
		buffer += mapping(val);
	}
	console.log(buffer)
	console.log(buffer)
}