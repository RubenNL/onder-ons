import Swipe from './task-swipe'
const tasks = {
	swipe: Swipe,
}
export default function task(task, stage, cb) {
	return new tasks[task](stage, finished => {
		cb(finished)
	})
}
