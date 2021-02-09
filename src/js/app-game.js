import {LitElement, html} from 'lit-element'
import {Stage, Layer, Rect, Circle} from 'konva'
export class AppGame extends LitElement {
	static get properties() {
		return {
			killNearby: {type: String},
			reportNearby: {type: String},
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
	}
	render() {
		return html`
			<button ?disabled=${!this.killNearby} @click="${() => this.sendMessage({action: 'kill'})}">kill</button>
			<button ?disabled=${!this.reportNearby} @click="${() => this.sendMessage({action: 'report'})}">report</button>
			<div id="container"></div>
		`
	}
	sendMessage(message) {
		this.dispatchEvent(new CustomEvent('ws-send', {detail: message}))
	}
	firstUpdated() {
		var stage = new Stage({
			container: this.shadowRoot.querySelector('#container'),
			width: 800,
			height: 800,
		})
		this.backgroundLayer = new Layer()
		stage.add(this.backgroundLayer)
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
		stage.add(layer)
		layer.draw()
		var container = stage.container()
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
				this.backgroundLayer.draw()

				const p = this.backgroundLayer.getContext('2d').getImageData(400, 400, 1, 1).data
				const hexColor = '#' + ('000000' + this.rgbToHex(p[0], p[1], p[2])).slice(-6)
				if (hexColor != '#000000') {
					this.backgroundLayer.position(oldPos)
					this.backgroundLayer.draw()
					this.pos = oldPos
				} else this.sendMessage({pos: this.pos})
				e.preventDefault()
			}).bind(this)
		)
	}
	rgbToHex(r, g, b) {
		if (r > 255 || g > 255 || b > 255) throw 'Invalid color component'
		return ((r << 16) | (g << 8) | b).toString(16)
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
			this.backgroundBoxes = data.map
			this.backgroundBoxes.forEach(box => {
				this.backgroundLayer.add(new Rect({...box, fill: 'red', stroke: 'blue'}))
			})
			this.backgroundLayer.scale({x: 0.5, y: 0.5})
		}
	}
	distance(first, second) {
		if (!first) return Number.MAX_SAFE_INTEGER
		if (!second) return Number.MAX_SAFE_INTEGER
		return Math.sqrt(Math.abs(first.x - second.x) ** 2 + Math.abs(first.y - second.y) ** 2)
	}
}
customElements.define('app-game', AppGame)
