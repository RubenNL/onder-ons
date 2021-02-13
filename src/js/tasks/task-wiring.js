import {Layer, Rect, Line} from 'konva'
export default class TaskWiring {
	constructor(stage, cb) {
		this.stage = stage
		this.cb = cb
		this.finished = false
		this.layer = new Layer()
		this.colors = ['red', 'green', 'blue', 'yellow']
		this.switchedColors = JSON.parse(JSON.stringify(this.colors)).sort(() => 0.5 - Math.random())
		this.stage.add(this.layer)
		this.switchedColors.forEach((color, index) => {
			this.layer.add(
				new Rect({
					x: 500,
					y: 100 + index * 100,
					height: 20,
					width: 20,
					fill: color,
				})
			)
		})
		this.draggables = this.colors.map((color, index) => {
			return new Rect({
				x: 100,
				y: 100 + index * 100,
				height: 20,
				width: 20,
				fill: color,
				draggable: true,
				dragBoundFunc: pos => {
					if (pos.x < 100) pos.x = 100
					if (pos.y < 100) pos.y = 100
					if (pos.x > 500) pos.x = 500
					if (pos.y > 400) pos.y = 400
					return pos
				},
			})
		})
		this.draggables.forEach(
			((item, index) => {
				item.done = false
				item.start = [item.x(), item.y()]
				item.dragRect = new Line({
					points: [...item.start, ...item.start],
					stroke: item.fill(),
					strokeWidth: 10,
				})
				this.layer.add(item.dragRect)
				item.target = this.switchedColors.indexOf(this.colors[index]) * 100 + 100
				item.on(
					'dragmove',
					(() => {
						item.dragRect.points([...item.start, item.x(), item.y()])
						this.layer.batchDraw()
					}).bind(this)
				)
				item.on(
					'dragend',
					(() => {
						if (item.x() < 480) {
							item.position({x: item.start[0], y: item.start[1]})
							item.done = false
						} else {
							item.x(500)
							item.y(Math.round(item.y() / 100) * 100)
							item.done = item.y() == item.target
						}
						item.dragRect.points([...item.start, item.x(), item.y()])
						if (this.draggables.filter(item => item.done).length == 4) this.finish()
					}).bind(this)
				)
				this.layer.add(item)
			}).bind(this)
		)
		this.layer.batchDraw()
	}
	finish() {
		this.finished = true
		this.destroy()
	}
	destroy() {
		this.layer.destroy()
		this.cb(this.finished)
	}
}
