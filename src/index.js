window.canvassize = 800
import 'js/app-chat.js'
import 'js/app-game.js'
const gameId = location.hash.split('#')[1] || prompt('gameId?', Math.random().toString(36).substring(7))
if (!gameId) {
	alert('geen game ID!')
	throw new Error()
}
location.hash = '#' + gameId
const name = window.sessionStorage.getItem('name') || prompt('naam?')
if (!name) {
	alert('geen naam!')
	throw new Error()
}
window.sessionStorage.setItem('name', name)
document.querySelector('#start').onclick = () => {
	const speed = parseInt(prompt('snelheid?'))
	if (!speed || speed < 5 || speed > 20) {
		alert('Ongeldige snelheid!')
		return
	}
	ws.send({start: {speed}})
}

const ws = new WebSocket((location.protocol == 'http:' ? 'ws://' : 'wss://') + (location + '').split('/')[2] + '/?game=' + gameId)
window.ws = ws
ws.oldSend = ws.send
ws.send = message => ws.oldSend(JSON.stringify(message))
ws.addEventListener('open', () => {
	ws.send({name})
	setInterval(() => ws.send({}), 45000) //keepalive for heroku: https://devcenter.heroku.com/articles/http-routing#timeouts
})
ws.addEventListener('close', event => {
	if (event.reason) alert('verbinding verbroken:\n' + event.reason)
	else alert('verbinding verbroken, geen reason opgegeven.')
})
ws.addEventListener('message', event => {
	const data = JSON.parse(event.data)
	switch (data.action) {
		case 'start':
			document.querySelector('#start').disabled = true
			break
	}
	document.querySelector('app-game').onMessage(data)
	document.querySelector('app-chat').onMessage(data)
})
document.querySelector('app-chat').addEventListener('ws-send', e => ws.send(e.detail))
document.querySelector('app-game').addEventListener('ws-send', e => ws.send(e.detail))
