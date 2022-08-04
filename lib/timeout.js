const { randomInt } = require('crypto')

function createTimer(MIN_PARSE_DELAY, MAX_PARSE_DELAY) {
	async function randomTimeout(cons) {
		let delay
		delay = MIN_PARSE_DELAY
		if (typeof MAX_PARSE_DELAY === 'number') {
			delay = randomInt(MIN_PARSE_DELAY, MAX_PARSE_DELAY)
		}
		if (cons) cons(delay)
		await new Promise((resolve) => {
			setTimeout(resolve, delay)
		})
		return delay
	}
	return randomTimeout
}

module.exports = createTimer
