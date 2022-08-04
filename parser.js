// IMPORTS:
const { cons, fs, request } = global.api

const {
	SCAN_INTERVAL,
	MIN_PARSE_DELAY,
	MAX_PARSE_DELAY,
	DELETE_TIME,
	PARSE_DEPTH,
	PARSING_URL,
	SEND_URL,
	ORDER_BASE_URL,
	RUCAPTCHA_APIKEY,
	PARSING_REQUEST_HEADERS,
} = global.api.config

const rucaptchaClient = require('./core/rucaptchaClient.js')(RUCAPTCHA_APIKEY)

const { getSolvedCaptchaURL } = require('./core/urlParser.js')

// Load cache:
// Has fields: lastOrders, newOrdersArray, lastSendTime
const CACHE = require('./core/loadCache.js')

// FUNCTIONS:
const requestRandomTimeout = require('./lib/timeout.js')(
	MIN_PARSE_DELAY,
	MAX_PARSE_DELAY
)
const scanRandomTimeout = require('./lib/timeout.js')(SCAN_INTERVAL)

// Using: fs, CACHE.lastOrders
const deleteOutdatedOrders = () => {
	let fileData = ''
	let count = 0
	for (const orderId in CACHE.lastOrders) {
		const DIFF_TIME = new Date().getTime() - CACHE.lastOrders[orderId]
		if (DIFF_TIME >= DELETE_TIME) {
			count++
			delete CACHE.lastOrders[orderId]
		} else {
			fileData += orderId + ' = ' + CACHE.lastOrders[orderId] + '\n'
		}
	}
	if (count > 0) cons.log('Outdated orders has been deleted', { count })
	fs.writeFileSync('./cache/lastOrders.txt', fileData)
}

const parseOrdersRequest = require('./core/parseOrdersRequest.js')
const sendOrdersRequest = require('./core/sendOrdersRequest.js')

// Using: PARSING_URL, PARSING_REQUEST_HEADERS, parseOrdersRequest, saveParsedData, deleteOutdatedOrders,
// CACHE.newOrdersArray, CACHE.lastSendTime, Parser, Parser.status

// Using: parseLoop, CACHE.newOrdersArray, sendOrdersArray, deleteOutdatedOrders, scanRandomTimeout,  Parser.status
async function workLoop() {
	await parseLoop()
	if (CACHE.newOrdersArray.length > 0) {
		await sendOrdersArray()
	}
	deleteOutdatedOrders()
	await scanRandomTimeout((delay) => {
		cons.log('Scan timeout: ' + delay / 1000 + ' s')
	})
	if (Parser.status === 1) workLoop()
}
// PARSING DATA BLOCK:
async function parseLoop() {
	let pageNum = 1
	while (pageNum <= PARSE_DEPTH) {
		cons.log('Parsing page', { pageNum })
		await requestRandomTimeout((delay) => {
			cons.log('Request timeout: ' + delay / 1000 + ' s')
		})
		try {
			const { data } = await parseOrdersRequest(PARSING_URL + '&p=' + pageNum, {
				headers: PARSING_REQUEST_HEADERS,
			})
			if (data.indexOf('captcha-page') !== -1) {
				cons.log('Captcha has been required')
				cons.log(JSON.parse(data))
				const captcha = JSON.parse(data).captcha
				const imageURL = captcha['img-url']
				const response = await request(imageURL)
				const correctImageURL = response.headers.location
				const answer = await rucaptchaClient.getAnswer(correctImageURL)
				cons.log('Rucaptcha answer', answer)
				fs.appendFileSync(
					'./logs/rucaptcha.log',
					`${new Date().toLocaleString()} - ${JSON.stringify(answer)}\n`
				)
				if (answer.value) {
					const captchaRep = answer.value
					const captchaHref = captcha['captcha-page']
					const captchaKey = captcha.key
					const solvedCaptchaURL = getSolvedCaptchaURL(
						captchaHref,
						captchaKey,
						captchaRep
					)
					const response = await parseOrdersRequest(solvedCaptchaURL, {
						headers: PARSING_REQUEST_HEADERS,
						method: 'POST',
					})
					cons.log(response.headers)
					const setCookie = response.headers['set-cookie']

					if (setCookie) {
						cons.log('New cookie has been installed')

						function destructCookie(cookie) {
							const cookieObject = {}
							const cookieItems = cookie.split(';')
							cookieItems.forEach((item) => {
								const key = item.split('=')[0].trim()
								const value = item.split('=')[1].trim()
								cookieObject[key] = value
							})
							return cookieObject
						}

						function joinCookie(cookieObject) {
							const cookie = []
							for (const key in cookieObject) {
								cookie.push(key + '=' + cookieObject[key])
							}
							return cookie.join('; ')
						}

						function addCookieItem(cookie, item) {
							const itemKey = item.split('=')[0]
							const itemValue = item.slice((itemKey + '=').length)
							const cookieObject = destructCookie(cookie)
							cookieObject[itemKey] = itemValue
							return joinCookie(cookieObject)
						}

						const setCookieItem = setCookie.split(';')[0]
						PARSING_REQUEST_HEADERS.Cookie = addCookieItem(
							PARSING_REQUEST_HEADERS.Cookie,
							setCookieItem
						)
						PARSING_REQUEST_HEADERS.Referer = captchaHref
					} // if (setCookie)
				} // if (answer.value)
			} else {
				saveParsedData(data)
				pageNum++
			}
		} catch (error) {
			const errorMessage = {
				parseRequestError: error,
				time: new Date().toLocaleString(),
			}
			cons.log('parseRequestError', {
				error,
			})
			const errorsString =
				errorMessage.time +
				' : parseRequestError ' +
				errorMessage.parseRequestError +
				'\n'
			fs.appendFileSync('./logs/errors.log', errorsString)
		}
	}
}

// Data structure:
// Using: fs, cons, CACHE.lastOrders, CACHE.newOrdersArray, saveParsedData, deleteOutdatedOrders,
const saveParsedData = (data) => {
	try {
		const orders = JSON.parse(data).orders.items
		let count = 0

		let lastOrdersDataString = ''

		for (const orderId in orders) {
			// If order with that ID has already been added
			if (Object.prototype.hasOwnProperty.call(CACHE.lastOrders, orderId))
				continue

			// If order with that ID has been returned first time:
			const type = 1
			const { title, description } = orders[orderId]
			const rubric =
				orders[orderId].rubricsNames.occupation +
				'/' +
				orders[orderId].rubricsNames.specialization
			const contact = orders[orderId].customerName
			const phone = orders[orderId].customerTruncatedPhone
			const region = orders[orderId].address.nameComponents.province
			const city = orders[orderId].address.nameComponents.locality
			const url = ORDER_BASE_URL + orderId + '/'

			const struct = {
				type,
				title,
				description,
				rubric,
				contact,
				region,
				city,
				url,
			}

			if (phone.length === 12) struct.phone = phone

			const time = new Date().getTime()

			CACHE.lastOrders[orderId] = time
			CACHE.newOrdersArray.push(struct)

			lastOrdersDataString += orderId + ' = ' + time + '\n'
			count++
		}

		fs.appendFileSync('./cache/lastOrders.txt', lastOrdersDataString)

		if (count > 0) cons.log('Items has been added', { count })
		else cons.log('No items has been added', { count })
		return true
	} catch (error) {
		const errorMessage = {
			saveParsedDataError: error,
			time: new Date().toLocaleString(),
		}
		cons.log('saveParsedDataError', {
			error,
		})
		const errorsString =
			errorMessage.time +
			' : saveParsedDataError ' +
			errorMessage.saveParsedDataError +
			'\n'
		fs.appendFileSync('./logs/errors.log', errorsString)
		return false
	}
}

async function sendOrdersArray() {
	const ordersCount = CACHE.newOrdersArray.length
	try {
		const response = await sendOrdersRequest(SEND_URL, CACHE.newOrdersArray)
		const sendTime = new Date().toLocaleString()
		let string = sendTime + ': '
		string += ordersCount + ' orders has been sent' + ': ' + '\n'
		for (let i = 0; i < ordersCount; i++) {
			string += i + 1 + ') ' + CACHE.newOrdersArray[i].url + '\n'
		}
		string += '\n'
		const fileData = string
		fs.appendFileSync('./logs/sentOrders.log', fileData)
		CACHE.newOrdersArray = []
		cons.log('Items has been sent', {
			ordersCount,
			url: SEND_URL,
			response,
		})
		const time = new Date().getTime()
		CACHE.lastSendTime = time
		fs.writeFileSync('./cache/lastSendTime.txt', time.toString())
	} catch (err) {
		const errorMessage = {
			time: new Date().toLocaleString(),
			sendRequestError: err,
		}
		cons.log('sendRequestError', {
			err,
		})
		const errorsString =
			errorMessage.time + ' : sendRequestError : ' + err + '\n'
		fs.appendFileSync('./logs/errors.log', errorsString)
	}
}

// Using: PARSING_URL, CACHE.lastOrders, CACHE.newOrdersArray, CACHE.lastSendTime, Parser.status
const Parser = {
	status: 0, // 0: parser stopped, 1: parser started
	start: () => {
		let message
		if (Parser.status === 0) {
			Parser.status = 1
			message = 'Parsing has been started'
			workLoop()
		} else {
			message = 'Cannot start. Parser is already working'
		}
		cons.log(message, { PARSING_URL, SEND_URL })
		return message
	},
	stop: () => {
		let message
		if (Parser.status === 1) {
			Parser.status = 0
			CACHE.lastOrders = {}
			message = 'Parsing loop has been stopped'
		} else {
			message = 'Cannot stop. Parser is not working'
		}
		cons.log(message, { PARSING_URL })
		return message
	},
}

// Background tasks:
require('./core/truncateLogFiles.js')

module.exports = Parser
