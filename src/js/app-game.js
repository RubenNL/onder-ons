import {LitElement, html} from 'lit-element'
import {Stage, Layer, Rect, Circle} from 'konva'
import getTask from './tasks/tasks.js'
export class AppGame extends LitElement {
	static get properties() {
		return {
			killNearby: {type: String},
			reportNearby: {type: String},
			useNearby: {type: String},
		}
	}
	constructor() {
		super()
		this.players = []
		this.playerBoxes = []
		this.speed = 5
		this.pos = {x: 0, y: 0}
		this.killNearby = ''
		this.reportNearby = ''
		this.useNearby = ''
	}
	render() {
		return html`
			<button ?disabled=${!this.killNearby} @click="${() => this.sendMessage({action: 'kill'})}">kill</button>
			<button ?disabled=${!this.reportNearby} @click="${() => this.sendMessage({action: 'report'})}">report</button>
			<button ?disabled=${!this.useNearby} @click="${this.use}">use</button>
			<div id="container"></div>
		`
	}
	use() {
		this.currentTask = getTask(this.useNearbyBox.action, this.stage, this.taskClosed)
	}
	/*	taskClosed(finished) {
		console.log(finished)
	}
*/ sendMessage(message) {
		this.dispatchEvent(new CustomEvent('ws-send', {detail: message}))
	}
	firstUpdated() {
		this.stage = new Stage({
			container: this.shadowRoot.querySelector('#container'),
			width: 800,
			height: 800,
		})
		this.backgroundLayer = new Layer()
		this.stage.add(this.backgroundLayer)
		var layer = new Layer()
		this.circle = new Circle({
			x: 397.5,
			y: 397.5,
			radius: 5,
			fill: 'blue',
			stroke: 'black',
			strokeWidth: 4,
		})
		layer.add(this.circle)
		this.stage.add(layer)
		layer.draw()
		var container = this.stage.container()
		container.tabIndex = 1
		container.focus()
		container.addEventListener(
			'keydown',
			(e => {
				const oldPos = this.backgroundLayer.position()
				if (e.keyCode === 37) this.backgroundLayer.x(this.backgroundLayer.x() + this.speed)
				else if (e.keyCode === 38) this.backgroundLayer.y(this.backgroundLayer.y() + this.speed)
				else if (e.keyCode === 39) this.backgroundLayer.x(this.backgroundLayer.x() - this.speed)
				else if (e.keyCode === 40) this.backgroundLayer.y(this.backgroundLayer.y() - this.speed)
				else return
				this.pos = this.backgroundLayer.position()
				const boxes = this.backgroundBoxes
					.map(box => {
						return {...box, x: -box.x, y: -box.y}
					})
					.filter(box => {
						box = JSON.parse(JSON.stringify(box))
						box.x += 400
						box.y += 400
						if (box.x > this.pos.x && box.x - box.width < this.pos.x && box.y > this.pos.y && box.y - box.height < this.pos.y) return true
						return false
					})
				if (boxes.length > 0) {
					this.backgroundLayer.position(oldPos)
					this.pos = oldPos
				} else {
					this.sendMessage({pos: this.pos})
					this.useNearbyBox = this.useLocations
						.map(box => {
							return {...box, x: -box.x + 400, y: -box.y + 400}
						})
						.filter(location => {
							return this.distance({x: location.x, y: location.y}, this.pos) < 50
						})[0]
					this.useNearby = this.useNearbyBox ? 'true' : ''
				}
				e.preventDefault()
				this.backgroundLayer.batchDraw()
			}).bind(this)
		)
	}
	onMessage(data) {
		if (data.you) {
			this.me = data.you
			this.circle.fill = this.me.imposter ? 'red' : 'green'
		}
		if (data.players) {
			this.playerBoxes.forEach(box => {
				box.destroy()
			})
			this.killNearby = ''
			this.reportNearby = ''
			data.players.forEach(
				(player => {
					if (!player.pos) return
					var circle = new Rect({
						x: 400 - player.pos.x,
						y: 400 - player.pos.y,
						width: player.dead ? 10 : 5,
						height: player.dead ? 5 : 10,
						fill: player.imposter ? 'red' : 'green',
						stroke: 'black',
						strokeWidth: 4,
					})
					this.playerBoxes.push(circle)
					this.backgroundLayer.add(circle)
					if (!this.me.dead && this.me.imposter && !player.dead && !player.imposter && this.distance(player.pos, this.pos) < 50) this.killNearby = 'true'
					if (!this.me.dead && player.dead && this.distance(player.pos, this.pos) < 50) this.reportNearby = 'true'
				}).bind(this)
			)
			this.backgroundLayer.batchDraw()
		}
		if (data.speed) this.speed = data.speed
		if (data.map) {
			this.backgroundBoxes = data.map.walls
			this.backgroundBoxes.forEach(box => {
				this.backgroundLayer.add(new Rect({...box, fill: 'red', stroke: 'blue'}))
			})
			this.useLocations = data.map.useLocations
			this.useLocations.forEach(box => {
				this.backgroundLayer.add(new Rect({x: box.x - 5, y: box.y - 5, fill: 'purple', stroke: 'green', height: 10, width: 10}))
			})
		}
	}
	distance(first, second) {
		if (!first) return Number.MAX_SAFE_INTEGER
		if (!second) return Number.MAX_SAFE_INTEGER
		return Math.sqrt(Math.abs(first.x - second.x) ** 2 + Math.abs(first.y - second.y) ** 2)
	}
}
customElements.define('app-game', AppGame)
