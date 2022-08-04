const { Rucaptcha } = require('rucaptcha-client')
const { cons } = global.api

let client

async function getAnswer(imageUrl) {
	cons.log('Start rucaptcha request')
	const balance = await client.getBalance()
	try {
		const value = await client.solve(imageUrl)
		return { balance, value: value.text }
	} catch (error) {
		return { balance, error }
	}
}

function createClient(apikey) {
	client = new Rucaptcha(apikey)
	client.getAnswer = getAnswer
	return client
}

module.exports = createClient
