const { request, decompress } = global.api

// # Parse data request:
const getOrdersRequest = (__TARGETURL, __OPTIONS) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await request(__TARGETURL, __OPTIONS)
			const contentEncoding = response.headers['content-encoding']
			const chunks = []
			response.body.on('data', (chunk) => {
				chunks.push(chunk)
			})
			response.body.on('end', () => {
				const buffer = Buffer.concat(chunks)
				let data
				if (contentEncoding) data = decompress(buffer, contentEncoding)
				else data = buffer.toString()
				resolve({ headers: response.headers, data })
			})
		} catch (err) {
			reject(err)
		}
	})
}

module.exports = getOrdersRequest

// const fs = require('fs')
// const requestHeaders = JSON.parse(fs.readFileSync('./headers.json', 'utf8'))

// const setCookie = response.headers['set-cookie']
// if (setCookie) {
//     // requestHeaders.cookie = setCookie
//     // fs.writeFileSync('./headers.json', JSON.stringify(requestHeaders, null, '\t'), 'utf8')
// }
