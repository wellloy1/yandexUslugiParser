const { fs, cons } = global.api

// Init local memory objects:
// USES: CACHE
const CACHE = {}
// Last orders IDs and time when it has been added to cache
// Example: '3fe68ce0-0ab5-4e44-a0bb-e29e3a73ca24': 1647801678280
CACHE.lastOrders = {}

// An array of the orders objects prepared to send to the server
// Example: { type, title, ... }
CACHE.newOrdersArray = []

// The time when last order pack has been sent to the server
// Example: 1647806440201
CACHE.lastSendTime = 0

// Load lastOrders:

const lastOrdersDataString = fs.readFileSync('./cache/lastOrders.txt', 'utf-8')

const lastOrdersDataArray = lastOrdersDataString
	.split('\n')
	.filter((line) => !!line)

for (let i = 0; i < lastOrdersDataArray.length; i++) {
	const item = lastOrdersDataArray[i].split(' = ')
	const orderId = item[0]
	const time = item[1] * 1 // Convert 'string' to type 'number'
	CACHE.lastOrders[orderId] = time
}

// Load lastSendTime:
const lastSendTimeString = fs.readFileSync('./cache/lastSendTime.txt', 'utf-8')

CACHE.lastSendTime =
	// Converts 'string' to type 'number'
	lastSendTimeString.split('\n').filter((line) => !!line)[0] * 1 || null

cons.log({
	newOrdersArray: CACHE.newOrdersArray.length,
	lastOrders: CACHE.lastOrders,
	lastSendTime: CACHE.lastSendTime,
})

module.exports = CACHE
