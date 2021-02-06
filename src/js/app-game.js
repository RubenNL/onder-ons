import {LitElement, html} from 'lit-element'
import {Stage, Layer, Rect, Circle} from 'konva'
export class AppGame extends LitElement {
	constructor() {
		super()
		this.players = []
		this.playerBoxes = []
		this.speed = 5
	}
	render() {
		return html`
			<button @click="${() => this.sendMessage({action: 'kill'})}">kill</button>
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
		var circle = new Circle({
			x: 395,
			y: 395,
			radius: 5,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4,
		})
		layer.add(circle)
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
				const newPos = this.backgroundLayer.position()
				const boxes = this.backgroundBoxes
					.map(box => {
						return {...box, x: -box.x, y: -box.y}
					})
					.filter(box => {
						box = JSON.parse(JSON.stringify(box))
						box.x += 400
						box.y += 400
						if (box.x > newPos.x && box.x - box.width < newPos.x && box.y > newPos.y && box.y - box.height < newPos.y) return true
						return false
					})
				if (boxes.length > 0) this.backgroundLayer.position(oldPos)
				else {
					this.sendMessage({pos: newPos})
				}
				e.preventDefault()
				this.backgroundLayer.batchDraw()
			}).bind(this)
		)
	}
	onMessage(data) {
		if (data.players) {
			this.playerBoxes.forEach(box => {
				box.destroy()
			})
			data.players.forEach(player => {
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
			})
			this.backgroundLayer.batchDraw()
		}
		if (data.speed) this.speed = data.speed
		if (data.map) {
			this.backgroundBoxes = data.map
			this.backgroundBoxes.forEach(box => {
				this.backgroundLayer.add(new Rect({...box, fill: 'red', stroke: 'blue'}))
			})
		}
	}
}
customElements.define('app-game', AppGame)
