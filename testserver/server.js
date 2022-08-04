const http = require('http')
const fs = require('fs')


const PORT = 3000

const server = http.createServer()
server.listen(PORT, () => console.log('Server has been started on port ' + PORT))
server.on('request', (req, res) => {
	console.log('New request')
	console.log({ headers: req.headers })

	if (req.url === '/api') {
		let chunks = ''
		req.on('data', (chunk) => {
			chunks += chunk
		})
		req.on('end', () => {
			const data = JSON.parse(chunks.toString())
			console.log('New incoming data', { ordersCount: data.length })
			
			fs.writeFileSync(
				'./orders.json',
				JSON.stringify(data, null, '\t'),
				'utf8'
			)
		})
		res.end('Data received')
	} else {
		res.end('OK')
	}
})




module.exports = server
