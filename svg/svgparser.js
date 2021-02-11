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
