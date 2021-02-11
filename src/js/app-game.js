import {LitElement, html, css} from 'lit-element'
import {Stage, Layer, Rect, Circle, Path} from 'konva'
import getTask from './tasks/tasks'
import './app-minimap'
export class AppGame extends LitElement {
	static get properties() {
		return {
			killNearby: {type: String},
			reportNearby: {type: String},
			useNearby: {type: String},
			preview: {type: String},
		}
	}
	constructor() {
		super()
		this.players = []
		this.playerBoxes = []
		this.speed = 10
		this.pos = {x: 0, y: 0}
		this.killNearby = ''
		this.reportNearby = ''
		this.useNearby = ''
		this.scale = 0.5
		this.mapScale = 0.05
		this.moving = false
	}
	render() {
		return html`
			<button ?disabled=${!this.killNearby} @click="${() => this.sendMessage({action: 'kill'})}">kill</button>
			<button ?disabled=${!this.reportNearby} @click="${() => this.sendMessage({action: 'report'})}">report</button>
			<button ?disabled=${!this.useNearby} @click="${this.use}">use</button>
			<div id="container"></div>
			<app-minimap></app-minimap>
		`
	}
	static get styles() {
		return css`
			#map {
				position: absolute;
				right: 0px;
				top: 100px;
				height: 100px;
			}
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
		this.playerLayer = new Layer()
		this.playerLayer.scale({x: this.scale, y: this.scale})
		this.backgroundLayer = new Layer()
		this.stage.add(this.backgroundLayer)
		this.stage.add(this.playerLayer)
		this.playerLayer.draw()
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
				this.backgroundLayer.draw()
				this.pos = this.backgroundLayer.position()

				const p = this.backgroundLayer.getContext('2d').getImageData(400, 400, 1, 1).data
				const hexColor = '#' + ('000000' + this.rgbToHex(p[0], p[1], p[2])).slice(-6)
				if (hexColor != '#000000') {
					this.backgroundLayer.position(oldPos)
					this.pos = oldPos
				} else {
					this.sendMessage({pos: this.pos})
					this.useNearbyBox = this.useLocations
						.map(box => {
							return {...box, x: -box.x * this.scale + 400, y: -box.y * this.scale + 400}
						})
						.filter(location => {
							return this.distance({x: location.x, y: location.y}, this.pos) < 50
						})[0]
					this.useNearby = this.useNearbyBox ? 'true' : ''
					this.playerLayer.position(this.pos)
					this.playerLayer.draw()
				}
				this.backgroundLayer.draw()
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
			this.circle.fill(this.me.imposter ? 'red' : 'green')
			this.circle.draw()
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
						x: 800 - player.pos.x / this.scale,
						y: 800 - player.pos.y / this.scale,
						width: player.dead ? 20 : 10,
						height: player.dead ? 10 : 20,
						fill: player.imposter ? 'red' : 'green',
						stroke: 'black',
						strokeWidth: 4,
					})
					this.playerBoxes.push(circle)
					this.playerLayer.add(circle)
					if (!this.me.dead && this.me.imposter && !player.dead && !player.imposter && this.distance(player.pos, this.pos) < 50) this.killNearby = 'true'
					if (!this.me.dead && player.dead && this.distance(player.pos, this.pos) < 50) this.reportNearby = 'true'
				}).bind(this)
			)
			this.playerLayer.draw()
		}
		if (data.speed) {
			this.speed = data.speed
			this.mapPath.strokeWidth(data.speed * 2)
		}
		if (data.map) {
			this.mapPath = new Path({
				data: data.map.svg,
				stroke: 'purple',
				strokeWidth: 20,
			})
			this.backgroundLayer.add(this.mapPath)
			this.backgroundLayer.scale({x: this.scale, y: this.scale})
			this.useLocations = data.map.useLocations
			this.useLocations.forEach(box => {
				this.backgroundLayer.add(new Rect({x: box.x - 5, y: box.y - 5, fill: 'blue', height: 50, width: 50}))
			})
			this.backgroundLayer.scale({x: this.scale, y: this.scale})
			this.backgroundLayer.position({x: -data.map.spawn.x * this.scale + 400, y: -data.map.spawn.y * this.scale + 400})
			this.backgroundLayer.draw()
		}
		this.shadowRoot.querySelector('app-minimap').onMessage(data)
	}
	distance(first, second) {
		if (!first) return Number.MAX_SAFE_INTEGER
		if (!second) return Number.MAX_SAFE_INTEGER
		return Math.sqrt(Math.abs(first.x - second.x) ** 2 + Math.abs(first.y - second.y) ** 2)
	}
}
customElements.define('app-game', AppGame)
