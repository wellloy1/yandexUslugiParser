// Yandex Uslugi Parser
// Version: 2.0.0
// Author: Max Shane

const config = require('./config.js')
const fs = require('fs')
const cons = require('./lib/console.js')(true)
const { request } = require('undici')
const { decompress } = require('./lib/compress.js')

global.api = { config, cons, fs, request, decompress }

const { START_TIMEOUT, TEST, TEST_SERVER_PORT } = global.api.config

if (TEST) require('./testserver/server.js')(TEST_SERVER_PORT)

cons.log('YandexUslugi Parser 2.0.0')
cons.log(`Starting at ${START_TIMEOUT / 1000} seconds...`)

setTimeout(() => {
	const Parser = require('./parser.js')
	Parser.start()
}, START_TIMEOUT)
