//Used this script to generate the map.json.
let path = '6988 4024L7240 3760L7370 3760L7370 2710L7910 2710L7910 2500L7200 2500L7200 2760L6310 2760L6310 2388L6670 2010L6670 1920L7200 1920L7200 2010L7370 2010L7370 1790L7248 1790L6990 1546L6990 1500L6560 1500L6560 2015L5955 2620L5450 2620L5450 2880L7020 2880L7020 3738L6797 3960L5830 3960L5830 3370L5450 3370L5450 3450L5650 3450L5650 4050L6989 4050'
path = path.split('L').map(item => {
	item = item.split(' ').map(item => parseInt(item))
	return {x: item[0], y: item[1]}
})
let lastItem = path.shift()

function angle(cx, cy, ex, ey) {
	var dy = ey - cy
	var dx = ex - cx
	var theta = Math.atan2(dy, dx) // range (-PI, PI]
	theta *= 180 / Math.PI // rads to degs, range (-180, 180]
	//if (theta < 0) theta = 360 + theta; // range [0, 360)
	return theta
}
function distance(first, second) {
	if (!first) return Number.MAX_SAFE_INTEGER
	if (!second) return Number.MAX_SAFE_INTEGER
	return Math.sqrt(Math.abs(first.x - second.x) ** 2 + Math.abs(first.y - second.y) ** 2)
}
const rotated = path.map(item => {
	const result = {...item, rotation: Math.floor(angle(item.x, item.y, lastItem.x, lastItem.y)), width: Math.round(distance(item, lastItem)), height: 10}
	lastItem = item
	return result
})
require('fs').writeFileSync('walls.json', JSON.stringify(rotated, null, 2))
