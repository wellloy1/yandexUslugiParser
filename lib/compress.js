const zlib = require('zlib')

// Compression functions:
function compress(data, alg = 'gzip') {
	const compress = {
		gzip: (data) => zlib.gzipSync(data),
		br: (data) => zlib.brotliCompressSync(data),
	}
	return compress[alg](data)
}

function decompress(data, alg = 'gzip') {
	const decompress = {
		gzip: (data) => zlib.gunzipSync(data),
		br: (data) => zlib.brotliDecompressSync(data),
	}
	return decompress[alg](data)
}

module.exports = {
	compress,
	decompress,
}
