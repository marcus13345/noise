const FastSimplexNoise = require('./noise').default
const seedrandom = require('seedrandom');
const noiseGen2 = new FastSimplexNoise({
	frequency: 1,
	max: 1,
	min: -1,
	octaves: 1
});
const noiseGen3 = new FastSimplexNoise({
	frequency: 0.1,
	max: 1,
	min: 0,
	octaves: 4
});
const noiseGen4 = new FastSimplexNoise({
	frequency: 1,
	max: 1,
	min: -1,
	octaves: 1
});
const poleHeight = 1.3;
const timeStart = Date.now();
function dTime() {
	return (Date.now() - timeStart) / 10000
}

module.exports.terrainGen = function terrainGen(x, y) {
	if(Math.sqrt((x / 2)**2 + y**2) > 2) return null;

	const mapHeight = noiseGen.scaled([ x, y ]);
	//fragmentation, start at .3 ish
	const fragmentation = noiseGen.scaled([126734, 345678]) * 3
	const size = noiseGen.scaled([3670, 35]) ** 2 * 2;
	const distance = (Math.sqrt((x / 2)**2 + y**2));

	const continentBase = Math.atan((size - distance)/fragmentation);

	const lowFNoise = noiseGen3.scaled([x, y]);
	// return 
	return (continentBase * lowFNoise) + mapHeight;
	// return mapHeight;
}

module.exports.testGen = function testGen(x, y) {
	if(Math.sqrt((x / 2)**2 + y**2) > 2) return null;

	const topPadding = .8;
	const gradientTension = 1/2;
	const baselineOffset = dTime();
	const baselineAmplitude = 0.3;
	const baseline = (Math.sin(((x + baselineOffset) / 4) * Math.PI) * baselineAmplitude);
	const baseGradient = (1-((Math.abs((y + baseline) * topPadding) / 2) ** gradientTension)) * 100;

	const kRandom = 20;
	const randomTension = 1;
	const randomness1 = noiseGen2.scaled([ x + dTime(), y ]) ** randomTension * kRandom;
	const randomness2 = noiseGen4.scaled([ x - dTime(), y ]) ** randomTension * kRandom;
	const animRandom = (randomness1 * randomness2) / kRandom;

	return baseGradient + animRandom;
	// return mapHeight;
}


const masterng = seedrandom('terra');
const rngs = [
	seedrandom(Math.floor(masterng() * 100000)),
	seedrandom(Math.floor(masterng() * 100000)),
	seedrandom(Math.floor(masterng() * 100000)),
	seedrandom(Math.floor(masterng() * 100000)),
];
const plateGen = new FastSimplexNoise({
	frequency: .003,
	max: 1,
	min: 0,
	octaves: 10,
	random: rngs[0]
});
const riverGen = new FastSimplexNoise({
	frequency: .01,
	max: 1,
	min: 0,
	octaves: 40,
	random: rngs[1]
});
const basinGen = new FastSimplexNoise({
	frequency: .01,
	max: 1,
	min: 0,
	octaves: 8,
	random: rngs[1]
});
const terrainGen = new FastSimplexNoise({
	frequency: .1,
	max: 1,
	min: 0,
	octaves: 3,
	random: rngs[2]
});
module.exports.biomes = function biomes(x, y) {
	x += dTime() * 10;
	const plate = Math.E ** (-1 * ((20 * (plateGen.scaled([x/2, y + 100]) - 0.5)) ** 2));
	const basin = 1 - (Math.atan((basinGen.scaled([x/2, y]) - 0.5) * 32) + (Math.PI / 2)) / Math.PI
	const terrain = terrainGen.scaled([x/2, y + 100]);

	return ((
		basin + 
		(plate * (basin ** (1/7))) +
		terrain
	) / 3) * 8;
	return terrain * 8
}
module.exports.plates = function plates(x, y) {
  const input = plateGen.scaled([x, y]);
  const shelfPoint = 0.5;
  const shelfHigh = 0.5;
  const shelfLow = 0.05;
  const ridgeHeight = 0.1;
  const ridgeEnd = 0.1;
  const output = map(input,
    [0, ridgeHeight],
    [ridgeEnd, 0],
    [shelfPoint, shelfLow],
    [shelfPoint, shelfHigh],
    [1, 1]
  );

  // const output = map2(x / 1000, .4, .6, 0, 1);

  return Math.round(output * 255);
}

module.exports.rivers = function(x, y) {
  // const plate = Math.E ** (-1 * ((7 * riverGen.scaled([x, y])) ** 2));
  const input = riverGen.scaled([x, y]);
  const midpoint = 0.5
  const widthConstant = 0.05
  const output = input < midpoint - widthConstant ? 0
               : input < midpoint ? (input - (midpoint - widthConstant)) / widthConstant
               : input < midpoint + widthConstant ? 1 - (input - midpoint) / widthConstant
               : 0
  return Math.round(output * 255);
}

function map(number, ...points) {
  let previousY = points[0][0];
  let previousX = points[0][1];
  for(const [x, y] of points) {
    if(number <= x) {
      // console.log(
      //   'mapping',
      //   number.toFixed(2),
      //   'from range',
      //   previousX.toFixed(2), '-', x.toFixed(2),
      //   'to',
      //   previousY.toFixed(2), '-', y.toFixed(2)
      // );
      return number = map2(number, previousX, x, previousY, y);
    }
    previousY = y;
    previousX = x;
  }
  return number;
}

function map2(num, inMin, inMax, outMin, outMax) {
  return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// for(let input = 0; input < 1; input += 0.05)
//   console.log(input, map(input, [0, 0], [0.9, 1], [1, 1]))