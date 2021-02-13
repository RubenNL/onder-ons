const fs = require('fs')
const xml2js = require('xml2js')

const parser = new xml2js.Parser()
fs.readFile(__dirname + '/map.svg', function (err, data) {
	parser.parseString(data, function (err, result) {
		fs.writeFileSync(
			__dirname + '/../map.json',
			JSON.stringify(
				{
					svg: result.svg.path[0].$.d,
					useLocations: [
						{
							x: 6673,
							y: 3372,
							action: 'swipe',
						},
						{
							x: 4219,
							y: 236,
							action: 'wiring',
						},
						{
							x: 3328,
							y: 3154,
							action: 'wiring',
						},
						{
							x: 1912,
							y: 2503,
							action: 'wiring',
						},
						{
							x: 4877,
							y: 3453,
							action: 'wiring',
						},
					],
					spawn: {
						x: 5200,
						y: 1000,
					},
				},
				null,
				'\t'
			),
			'utf8'
		)
	})
})
