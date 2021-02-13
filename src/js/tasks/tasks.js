import Swipe from './task-swipe'
import Wiring from './task-wiring'
const tasks = {
	swipe: Swipe,
	wiring: Wiring,
}
export default function task(task, stage, cb) {
	return new tasks[task](stage, finished => {
		cb(finished)
	})
}
