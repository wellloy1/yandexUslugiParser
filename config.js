const START_TIMEOUT = 1000 * 2 // 2 sec
const SCAN_INTERVAL = 1000 * 60 * 30 // 30 min
const MIN_PARSE_DELAY = 1000 * 3 // 3 sec
const MAX_PARSE_DELAY = 1000 * 5 // 5 sec
const DELETE_TIME = 1000 * 60 * 60 * 72 // 3 days

const PARSE_DEPTH = 20

const PARSING_URLS = {
	1: 'https://uslugi.yandex.ru/api/orders?completely_moderated=1&type=new',
	2: 'https://functions.yandexcloud.net/d4ekf12s3angcm0r9nbk?password=parser123',
}

const PARSING_URL = PARSING_URLS[1]

const SEND_URLS = {
	1: 'http://localhost:3000/api',
	2: 'https://dev.bazazakazov.ru/api/api.php',
	3: 'https://bazazakazov.ru/api/api.php',
}

const SEND_URL = SEND_URLS[2]

const ORDER_BASE_URL = 'https://uslugi.yandex.ru/order/'

const RUCAPTCHA_APIKEY = '630de01e4ffc8c765e68ac5d5745a2a5'

const PARSING_REQUEST_HEADERS = require('./core/headers.js')

const LOGFILE_MAX_SIZE = 1024 * 1024 * 10 // 10 mb

const LOGFILE_TRUNCATE_INTERVAL = 1000 * 60 * 60 * 24 // 24 hours

module.exports = {
	START_TIMEOUT,
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
	LOGFILE_MAX_SIZE,
	LOGFILE_TRUNCATE_INTERVAL,
}
