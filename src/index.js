console.log('booting generators...');
const width = process.stdout.getWindowSize()[0];
const height = process.stdout.getWindowSize()[1];
const chalk = require('chalk');
const characterMapping = require('./characterMapping');
const gen = require('./generators');
// process.stdout.write('\x1b[?25l');
const { Image, BlankImage } = require('./Image');
const {Canvas} = require('canvas');
const w = 800, h = w / 2;
const canvas = new Canvas(w, h);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'magenta';
ctx.fillRect(0, 0, w, h);
const { createWriteStream } = require('fs');
const { EventEmitter } = require('stream');

function lerp(min, max, val) {
	return val*(max-min) + min;
}

const terrainMap = characterMapping.fromBuckets([
	[Number.NEGATIVE_INFINITY,  chalk.bgBlue.cyan('~')],
	[lerp(0, 1, 0.30),          chalk.bgBlue.cyan(' ')],
	[lerp(0, 1, 0.35),          chalk.bgYellow(' ')],
	[lerp(0, 1, 0.40),          chalk.bgGreen.greenBright(' ')],
	[lerp(0, 1, 0.50),          chalk.bgGreenBright(' ')],
	[lerp(0, 1, 0.65),          chalk.bgGreenBright.whiteBright(' ')],
	[lerp(0, 1, 0.70),          chalk.bgWhiteBright(' ')]
]);

function rainbowMap(min, max) {
	return characterMapping.fromDistribution(min, max, [
		chalk.bgHex('#396FE2')(' '),
		chalk.bgHex('#89DDFF')(' '),
		chalk.bgHex('#9ECE58')(' '),
		chalk.bgHex('#FAED70')(' '),
		chalk.bgHex('#FFCB6B')(' '),
		chalk.bgHex('#FF8F6E')(' '),
		chalk.bgHex('#FF5370')(' '),
		chalk.bgHex('#D62341')(' ')
	]);
}

function numberMap(min, max) {
	return characterMapping.fromDistribution(min, max, [
		chalk.bgHex('#396FE2').black('0'),
		chalk.bgHex('#89DDFF').black('1'),
		chalk.bgHex('#9ECE58').black('2'),
		chalk.bgHex('#FAED70').black('3'),
		chalk.bgHex('#FFCB6B').black('4'),
		chalk.bgHex('#FF8F6E').black('5'),
		chalk.bgHex('#FF5370').black('6'),
		chalk.bgHex('#D62341').black('7')
	]);
}

const tempMapAlt = characterMapping.fromDistribution(0, 100, [
	chalk.bgHex('#396FE2')(' '),
	chalk.bgHex('#89DDFF')(' '),
	chalk.bgHex('#9ECE58')(' '),
	chalk.bgHex('#FAED70')(' '),
	chalk.bgHex('#FFCB6B')(' '),
	chalk.bgHex('#FF5370')(' '),
	chalk.bgHex('#D62341')(' ')
]);



// const heightMap = rangeToCharacter([
// 	[Number.NEGATIVE_INFINITY,  chalk.bgBlue.cyan('~')],
// 	[lerp(min, max, 0.3),       chalk.bgBlue.cyan(' ')],
// 	[lerp(min, max, 0.35),      chalk.bgYellow(' ')],
// 	[lerp(min, max, 0.4),       chalk.bgGreen(' ')],
// 	[lerp(min, max, 0.45),      chalk.bgGreen.greenBright('/')],
// 	[lerp(min, max, 0.5),       chalk.bgGreenBright.green('X')],
// 	[lerp(min, max, 0.55),      chalk.bgGreenBright.green('/')],
// 	[lerp(min, max, 0.6),       chalk.bgGreenBright(' ')],
// 	[lerp(min, max, 0.65),      chalk.bgGreenBright.whiteBright('/')],
// 	[lerp(min, max, 0.7),       chalk.bgWhiteBright(' ')]
// ])

let statMin = Number.POSITIVE_INFINITY, statMax = Number.NEGATIVE_INFINITY;

function draw(generator, charMap) {
	
	let image = new Image(width, height);
	for(let y = 0; y < height; y ++) {
		for(let x = 0; x < width; x ++) {

			const mapX = (x - width / 2), mapY = (y - height / 2);
			const value2d = generator(mapX, mapY);

			if(value2d == null) image.set(x, y, chalk.reset(' '));
			else image.set(x, y, (charMap(value2d)));
		}
	}

	image.render(0, 0)

}

function imageDraw(generator) {
  for(let y = 0; y < h; y ++) {
    for(let x = 0; x < w; x ++) {

      const mapX = (x) * (800 / w);
      const mapY = ((y) * (800 / w)) + 9283457;
      const value2d = generator(mapX, mapY);

      ctx.fillStyle = value2d;
      ctx.fillRect(x, y, 1, 1);
    }
    const progress = (((y + 1) * w)) / (w * h);
    process.stdout.write('[' + '='.repeat(progress * (process.stdout.columns - 2)).padEnd(process.stdout.columns - 2, '-') + ']\r');
  }
  console.log();
}

async function animateZoom(generator, mappingFn) {
	for(let i = 0; i < 8; i += 0.2) {
		draw(generator, i, mappingFn);
		await new Promise(res => setTimeout(res, 0));
	}
}

async function animate(generator, zoom, mappingFn) {
	while(true) {
		draw(generator, zoom, mappingFn);
		await new Promise(res => setTimeout(res, 0));
	}
}

// animate(terrainGen, 2, terrainbowMap)
// animate(terrainGen, 2, terrainMap)
// animate(testGen, 2, rainbowMap(-20, 20))


// console.log('statMin', statMin);
// console.log('statMax', statMax);



// draw((x, y) => {
// 	return gen.plates(x, y) - (gen.rivers(x, y))
// }, numberMap(-1, 1));
// draw(gen.rivers, numberMap(-1, 1));
// draw(gen.plates, numberMap(-1, 1));



class World {
  voxels = null;
  events = new EventEmitter();
  w;
  h;
  emitCounter = 0;

  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.voxels = [];
    setTimeout(() => {
      this.events.emit('task', 'initial formation');
      for(x = 0; x < w; x ++) {
        voxels[x] = [];
        for(y = 0; y < h; y ++) {
          voxels[x][y] = [];

        }
      }
    }, 0)
  }

  emitTask(name) {

  }

  emitProgress(total, current) {
    if((this.emitCounter % 100) === 0) {
      this.events.emit('progress', (current + 1) / total);
    }
    this.emitCounter ++;
  }

  getTop(x, y) {

  }

  getVoxel() {

  }

  getHeight(x, y) {
    return 
  }
}

class Voxel {

}

class Magma extends Voxel {
  makeup;

  constructor() {}
}

class Material {

}


// const world = new World();
// world.events.on('task', (taskName) => {

// })

console.log('generating image');
imageDraw((x, y) => {
  gen.plates(x, y)
  const color = '#' + .toString(16).padStart(2, '0').repeat(3);
  // console.log(color);
  return color;
});

console.log('writing image');
canvas.createPNGStream().pipe(createWriteStream('test.png'));
console.log('done');