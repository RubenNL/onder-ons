module.exports = class Game {
	constructor(player) {
		this.players = []
		this.addPlayer(player)
	}
	addPlayer(player) {
		this.players.push(player)
		player.send({id: this.players.indexOf(player)})
		player.on('message', message => {
			message = JSON.parse(message)
			if (message.name) {
				player.name = message.name
				this.sendAll({chat: {from: 'GAME', message: player.name + ' joined the game!'}})
				this.sendPlayerStats()
			}
			if (message.chat) this.sendAll({chat: {from: player.name, message: message.chat}})
		})
		player.on('close', () => {
			this.players.splice(this.players.indexOf(player), 1)
			this.sendAll({chat: {from: 'GAME', message: player.name + ' left the game!'}})
			this.sendPlayerStats()
			if (player == this.drawer) this.nextDrawer()
		})
	}
	sendPlayerStats() {
		this.sendAll({
			players: this.players.map(player => {
				return {
					name: player.name,
				}
			}),
		})
	}
	sendAll(message) {
		this.players.forEach(player => player.send(message))
	}
}
