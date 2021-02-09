import Swipe from './task-swipe'
const tasks = {
	swipe: Swipe,
}
export default function task(task, stage) {
	return new tasks[task](stage)
}
