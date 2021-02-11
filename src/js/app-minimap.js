import {LitElement, html, css} from 'lit-element'
import {Stage, Layer, Circle, Path} from 'konva'
export class AppMinimap extends LitElement {
	constructor() {
		super()
		this.mapScale = 0.05
		this.scale = 0.5
	}
	render() {
		return html` <div id="map"></div> `
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
	firstUpdated() {
		this.mapStage = new Stage({
			container: this.shadowRoot.querySelector('#map'),
			width: 9491 * this.mapScale,
			height: 6274 * this.mapScale,
		})
		this.mapLayer = new Layer()
		this.mapPlayer = new Circle({
			x: 397.5,
			y: 397.5,
			radius: 100,
			fill: 'blue',
			stroke: 'black',
			strokeWidth: 4,
		})
		this.mapLayer.add(this.mapPlayer)
		this.mapStage.add(this.mapLayer)
		this.mapLayer.scale({x: this.mapScale, y: this.mapScale})
		this.mapLayer.batchDraw()
	}
	onMessage(data) {
		if (data.you) {
			this.mapPlayer.position({
				x: (-data.you.pos.x + 400) / this.scale,
				y: (-data.you.pos.y + 400) / this.scale,
			})
			this.mapLayer.batchDraw()
		}
		if (data.map) {
			this.path = new Path({
				data: data.map.svg,
				stroke: 'purple',
				strokeWidth: 20,
			})
			this.mapLayer.add(this.path)
			this.mapLayer.batchDraw()
		}
		if (data.speed) this.path.strokeWidth(data.speed * 2)
	}
}
customElements.define('app-minimap', AppMinimap)
