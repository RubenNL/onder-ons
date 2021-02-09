import {Layer, Rect, Text} from 'konva'
export default class TaskSwipe {
	constructor(stage, cb) {
		this.stage = stage
		this.cb = cb
		this.finished = false
		this.layer1 = new Layer()
		this.stage.add(this.layer1)
		this.card = new Rect({
			x: 100,
			y: 100,
			height: 200,
			width: 300,
			fill: 'red',
			draggable: true,
			dragBoundFunc: pos => {
				return {
					x: pos.x,
					y: 100,
				}
			},
		})
		this.text = new Text({
			x: 300,
			y: 50,
			text: 'swipe!',
		})
		this.layer1.add(this.text)
		this.dragStart = 0
		this.card.on(
			'dragstart',
			(() => {
				this.dragStart = +new Date()
			}).bind(this)
		)
		this.card.on(
			'dragend',
			(() => {
				if (this.card.x() >= 500) {
					const dragTime = +new Date() - this.dragStart
					if (dragTime <= 500) this.text.text('too fast!')
					if (dragTime >= 1000) this.text.text('too slow!')
					if (dragTime > 500 && dragTime < 1000) {
						this.finish()
						return
					}
				}
				this.card.x(100)
			}).bind(this)
		)
		this.layer1.add(this.card)
		this.layer1.batchDraw()
	}
	finish() {
		this.finished = true
		this.destroy()
	}
	destroy() {
		this.layer1.destroy()
		this.cb(this.finished)
	}
}
