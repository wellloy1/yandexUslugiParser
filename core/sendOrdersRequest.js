const { request, decompress } = global.api

// # Send parsing structure request:
const sendOrdersRequest = async (__TARGETURL, __DATA) => {
	return new Promise(async (resolve, reject) => {
		try {
			const dataJSON = JSON.stringify(__DATA)
			const response = await request(__TARGETURL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: dataJSON,
			})
			const contentEncoding = response.headers['content-encoding']
			let chunks = ''
			response.body.on('data', (chunk) => {
				chunks += chunk
			})
			response.body.on('end', () => {
				const buffer = chunks
				let responseData
				if (contentEncoding) responseData = decompress(buffer, contentEncoding)
				else responseData = buffer
				const { statusCode, headers } = response
				resolve({ statusCode, headers, body: responseData })
			})
		} catch (err) {
			reject(err)
		}
	})
}

module.exports = sendOrdersRequest
