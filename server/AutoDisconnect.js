module.exports = class AutoDisconnect {
	constructor(ws) {
		this.disconnectTimeout = ''
		this.ws = ws
		const resetTimeout = this.resetTimeout.bind(this)
		this.ws.send = (_super => {
			return function () {
				if (arguments[0].length > 3) resetTimeout()
				return _super.apply(this, arguments)
			}
		})(this.ws.send)
		this.resetTimeout()
		this.ws.on('message', message => {
			if (message.length > 3) this.resetTimeout()
		})
		this.ws.on('close', () => clearTimeout(this.resetTimeout))
	}
	resetTimeout() {
		clearTimeout(this.disconnectTimeout)
		this.disconnectTimeout = setTimeout(() => this.ws.close(4321, 'Te lang inactief!'), 1000 * 60 * 3)
	}
}
