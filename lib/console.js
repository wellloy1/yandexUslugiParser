const util = require('util')

const Logger = (enable) => {
	const enabled = enable || false
	return {
		log: (message, data, e) => {
			const time = new Date().toLocaleString()
			let printline = ''
			printline += time
			printline += ': '
			let event = e || 'system'
			if (typeof data === 'string') {
				event = data
				data = null
			}
			printline += util.formatWithOptions({ colors: true }, '%O', event)
			if (typeof message === 'object') {
				data = message
				printline += ' '
				printline += util.formatWithOptions({ colors: true }, '%O', data)
			} else {
				printline += ' '
				printline += JSON.stringify(message)
				if (data) {
					printline += ' '
					printline += util.formatWithOptions({ colors: true }, '%O', data)
				}
			}

			!enabled || console.log(printline)
		},
	}
}

module.exports = Logger
