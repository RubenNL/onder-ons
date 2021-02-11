const Konva = require('konva-node')
module.exports = class Game {
	constructor(player) {
		this.players = []
		this.map = JSON.parse(require('fs').readFileSync('map.json'))
		this.stage = new Konva.Stage({
			width: 9988,
			height: 5592,
		})
		this.layer = new Konva.Layer()
		this.layer.scale({x: 0.5, y: 0.5})
		this.stage.add(this.layer)
		this.mapPath = new Konva.Path({
			data: this.map.svg,
			stroke: 'purple',
			strokeWidth: 20,
		})
		this.layer.add(this.mapPath)
		this.layer.draw()
		this.addPlayer(player)
	}
	addPlayer(player) {
		this.players.push(player)
		player.dead = false
		player.imposter = false
		player.send({id: this.players.indexOf(player), map: this.map})
		player.on('message', message => {
			message = JSON.parse(message)
			if (message.name) {
				player.name = message.name
				this.sendAll({chat: {from: 'GAME', message: player.name + ' joined the game!'}})

				this.sendPlayerStats()
			}
			if (message.pos) {
				const pos = {
					x: -message.pos.x + 400,
					y: -message.pos.y + 400,
				}
				if (
					this.layer
						.getContext('2d')
						.getImageData(pos.x, pos.y, 1, 1)
						.data.filter(item => item > 0).length > 0
				)
					player.send({chat: {from: 'GAME', message: 'in a wall!'}})
				if (player.pos && [message.pos.x - player.pos.x, message.pos.y - player.pos.y].map(Math.abs).filter(item => item > this.speed).length > 0) player.send({chat: {from: 'GAME', message: 'too fast!'}})
				if (!player.dead) player.pos = message.pos
				this.sendPlayerStats()
			}
			if (message.chat) this.sendAll({chat: {from: player.name, message: message.chat}})
			if (message.start) {
				this.speed = message.start.speed
				this.mapPath.strokeWidth(this.speed * 2)
				this.layer.draw()
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
					player.send({chat: {from: 'GAME', message: 'killed ' + killPlayer.name}})
					this.sendPlayerStats()
					break
				}
				case 'report': {
					const playerList = this.players.filter(searchPlayer => searchPlayer != player && searchPlayer.dead)
					const distanceList = playerList.map(searchPlayer => this.distance(searchPlayer.pos, player.pos))
					const distance = Math.min(...distanceList)
					if (distance > 50) {
						player.send({chat: {from: 'GAME', message: 'cant report from this distance!'}})
						return
					}
					const reportPlayer = playerList[distanceList.indexOf(distance)]
					this.sendAll({chat: {from: player.name, message: 'reported dead: ' + reportPlayer.name}})
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
		this.players[Math.floor(Math.random() * this.players.length)].imposter = true
		this.players.forEach(player => {
			player.send({chat: {from: 'GAME', message: 'You are ' + (player.imposter ? '' : ' NOT') + ' the imposter.'}})
		})
		this.sendPlayerStats()
	}
	sendPlayerStats() {
		this.players.forEach(sendPlayer => {
			sendPlayer.send({
				you: {imposter: sendPlayer.imposter, pos: sendPlayer.pos, dead: sendPlayer.dead},
				players: this.players
					.filter(player => player != sendPlayer || player.dead)
					.map(player => {
						return {
							name: player.name,
							...(this.distance(player.pos, sendPlayer.pos) < 400 ? {pos: player.pos, dead: player.dead} : {}),
							...(sendPlayer.imposter ? {imposter: player.imposter} : {}),
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
