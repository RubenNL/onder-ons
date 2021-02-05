import {LitElement, html} from 'lit-element'
import {Stage, Layer, Rect} from 'konva'
export class AppGame extends LitElement {
	constructor() {
		super()
		this.players = []
		this.playerBoxes = []
	}
	render() {
		return html`<div id="container"></div>`
	}
	firstUpdated() {
		let backgroundBoxes = [
			{x: 100, y: 100, width: 20, height: 200},
			{x: 100, y: 600, width: 200, height: 20},
			{x: 0, y: 0, width: 20, height: 800},
			{x: 0, y: 0, width: 800, height: 20},
			{x: 100, y: 100, width: 20, height: 20},
		]
		var stage = new Stage({
			container: this.shadowRoot.querySelector('#container'),
			width: 800,
			height: 800,
		})
		var backgroundLayer = new Layer()
		this.backgroundLayer = backgroundLayer
		backgroundBoxes.forEach(box => {
			backgroundLayer.add(new Rect({...box, fill: 'red', stroke: 'blue'}))
		})
		stage.add(backgroundLayer)
		var layer = new Layer()
		var circle = new Rect({
			x: 395,
			y: 395,
			width: 10,
			height: 5,
			fill: 'red',
			stroke: 'black',
			strokeWidth: 4,
		})
		layer.add(circle)
		stage.add(layer)
		layer.draw()
		var DELTA = 5
		var container = stage.container()
		container.tabIndex = 1
		container.focus()
		container.addEventListener(
			'keydown',
			(e => {
				const oldPos = backgroundLayer.position()
				if (e.keyCode === 37) backgroundLayer.x(backgroundLayer.x() + DELTA)
				else if (e.keyCode === 38) backgroundLayer.y(backgroundLayer.y() + DELTA)
				else if (e.keyCode === 39) backgroundLayer.x(backgroundLayer.x() - DELTA)
				else if (e.keyCode === 40) backgroundLayer.y(backgroundLayer.y() - DELTA)
				else return
				const newPos = backgroundLayer.position()
				const boxes = backgroundBoxes
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
				if (boxes.length > 0) backgroundLayer.position(oldPos)
				else {
					this.dispatchEvent(new CustomEvent('ws-send', {detail: {pos: newPos}}))
				}
				e.preventDefault()
				backgroundLayer.batchDraw()
			}).bind(this)
		)
	}
	onMessage(data) {
		if (data.players) {
			this.playerBoxes.forEach(box => {
				box.destroy()
			})
			data.players.forEach(player => {
				var circle = new Rect({
					x: 400 - player.pos.x,
					y: 400 - player.pos.y,
					width: 5,
					height: 10,
					fill: 'red',
					stroke: 'black',
					strokeWidth: 4,
				})
				this.playerBoxes.push(circle)
				this.backgroundLayer.add(circle)
			})
			this.backgroundLayer.batchDraw()
		}
	}
}
customElements.define('app-game', AppGame)
