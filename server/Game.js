module.exports = class Game {
	constructor(player) {
		this.players = []
		this.addPlayer(player)
	}
	addPlayer(player) {
		this.players.push(player)
		player.dead = false
		player.imposter = false
		player.send({id: this.players.indexOf(player)})
		player.on('message', message => {
			message = JSON.parse(message)
			if (message.name) {
				player.name = message.name
				this.sendAll({chat: {from: 'GAME', message: player.name + ' joined the game!'}})
				this.sendPlayerStats()
			}
			if (message.pos) {
				if (!player.dead) player.pos = message.pos
				this.sendPlayerStats()
			}
			if (message.chat) this.sendAll({chat: {from: player.name, message: message.chat}})
			if (message.start) {
				this.speed = message.start.speed
				this.sendAll({speed: this.speed})
				this.restartGame()
			}
			switch (message.action) {
				case 'kill': {
					if (!player.imposter) return
					const playerList = this.players.filter(searchPlayer => searchPlayer != player)
					const distanceList = playerList.map(searchPlayer => this.distance(searchPlayer.pos, player.pos))
					const distance = Math.min(...distanceList)
					if (distance > 50) {
						player.send({chat: {from: 'GAME', message: 'cant kill from this distance!'}})
						return
					}
					const killPlayer = playerList[distanceList.indexOf(distance)]
					killPlayer.dead = true
					this.sendPlayerStats()
					break
				}
			}
		})
		player.on('close', () => {
			this.players.splice(this.players.indexOf(player), 1)
			this.sendAll({chat: {from: 'GAME', message: player.name + ' left the game!'}})
			this.sendPlayerStats()
			if (player == this.drawer) this.nextDrawer()
		})
	}
	restartGame() {
		this.players.forEach(player => {
			player.dead = false
			player.imposter = false
		})
		const imposter = this.players[Math.floor(Math.random() * this.players.length)]
		imposter.imposter = true
	}
	sendPlayerStats() {
		this.players.forEach(player => {
			const pos = player.pos
			player.send({
				players: this.players.map(player => {
					return {
						name: player.name,
						...(this.distance(player.pos, pos) < 400 ? {pos: player.pos, dead: player.dead} : {}),
						...(player.imposter ? {imposter: player.imposter} : {}),
						dead: player.dead,
					}
				}),
			})
		})
	}
	distance(first, second) {
		if (!first) return Number.MAX_SAFE_INTEGER
		if (!second) return Number.MAX_SAFE_INTEGER
		return Math.sqrt(Math.abs(first.x - second.x) ** 2 + Math.abs(first.y - second.y) ** 2)
	}
	sendAll(message) {
		this.players.forEach(player => player.send(message))
	}
}
