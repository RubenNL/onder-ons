//Used this script to generate the map.json.
let paths = [
	'4457 5352L4210 5105L4210 5070L2440 5070L2440 4410L2040 4410L2040 4790L1215 4789L910 4555L910 3550L1330 3550L1330 2980L1050 2980L1050 3280L690 3280L690 3660L427 3660L10 3405L11 2045L431 1780L690 1780L690 2160L1050 2160L1050 2490L1330 2490L1330 1960L920 1960L921 975L1219 720L2040 720L2040 1000L3950 1000L3950 483L4430 10L5870 10L6560 682L6560 1000L6990 1000L6990 550L7579 550L8089 1045L8090 1790L7780 1790L7780 2010L8320 2010L8320 2320L8940 2320L8940 2010L9394 2010L9790 2351L9790 2796L9399 3120L8940 3120L8940 2810L8320 2810L8320 3200L7780 3200L7780 3760L8090 3760L8090 4498L7563 5010L6990 5010L6990 4540L6780 4540L6780 4670L6920 4670L6918 5355L6662 5590L5968 5590L5720 5356L5720 4670L6360 4670L6360 4540L5650 4540L5650 5600L4705 5600',
	'3030 3850L3030 3130L4250 3130L4250 3447L3960 3731L3960 4197L3710 4440L3420 4440L3420 4570L4210 4570L4210 3810L4575 3451L5030 3450L5030 2620L4535 2620L3950 2035L3950 1510L3520 1510L3520 1610L3685 1610L3850 1610L3850 2207L4250 2600L4250 2930L3025 2930L2830 2672L2830 1610L3110 1610L3110 1510L2040 1510L2040 1960L1740 1960L1740 2490L2060 2490L2060 2232L2285 2010L2536 2010L2710 2187L2710 3270L2060 3270L2060 2980L1740 2980L1740 3550L2040 3550L2040 3920L2840 3920L2840 4570L3030 4570',
	'6988 4024L7240 3760L7370 3760L7370 2710L7910 2710L7910 2500L7200 2500L7200 2760L6310 2760L6310 2388L6670 2010L6670 1920L7200 1920L7200 2010L7370 2010L7370 1790L7248 1790L6990 1546L6990 1500L6560 1500L6560 2015L5955 2620L5450 2620L5450 2880L7020 2880L7020 3738L6797 3960L5830 3960L5830 3370L5450 3370L5450 3450L5650 3450L5650 4050L6989 4050',
]
paths = paths.map(path =>
	path.split('L').map(item => {
		item = item.split(' ').map(item => parseInt(item))
		return {x: item[0], y: item[1]}
	})
)

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
function doPath(path) {
	let lastItem = path.shift()
	return path.map(item => {
		const result = {...item, rotation: Math.floor(angle(item.x, item.y, lastItem.x, lastItem.y)), width: Math.round(distance(item, lastItem)), height: 10}
		lastItem = item
		return result
	})
}
paths = paths.map(doPath).flat()
require('fs').writeFileSync('../map.json', JSON.stringify(paths, null, '\t'))
