const http = require('http')
const express = require('express')
const WebSocket = require('ws')
const app = express()
app.use(express.json())
const server = http.createServer(app)
const wss = new WebSocket.Server({server})
const compression = require('compression')
const serveIndex = require('serve-index')
app.use(compression({filter: shouldCompress}))
function shouldCompress(req, res) {
	if (req.headers['x-no-compression']) return false
	return compression.filter(req, res)
}

app.use(
	express.static('output', {
		setHeaders: function (res, path) {
			if (path.includes('js_commonjs-proxy')) res.set('Content-Type', 'application/javascript')
		},
	})
)

require('./server/server.js')(app, wss).then(() => {
	app.use('/code', express.static(__dirname, {index: false}))
	app.use('/code', serveIndex(__dirname))
})

server.listen(process.env.PORT || 8000)
