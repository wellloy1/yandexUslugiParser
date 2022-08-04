const { LOGFILE_MAX_SIZE, LOGFILE_TRUNCATE_INTERVAL } = global.api.config
const { fs, cons } = global.api

// Truncate logs
setInterval(() => {
	try {
		const dirs = fs.readdirSync('./logs')
		dirs.forEach((fileName) => {
			truncateFromTheBeginning(fileName)
		})
	} catch (err) {
		const errorMessage = {
			time: new Date().toLocaleString(),
			sendRequestError: err,
		}
		cons.log('truncateLogFileError', {
			err,
		})
		const errorsString =
			errorMessage.time + ' : truncateLogFileError : ' + err + '\n'
		fs.appendFileSync('../logs/errors.log', errorsString)
	}

	function ifFileSizeExceeded(fileSize) {
		return fileSize > LOGFILE_MAX_SIZE
	}
	function truncateFromTheBeginning(fileName) {
		const filePath = './logs/' + fileName
		const fileData = fs.readFileSync(filePath, 'utf8')
		const fileSize = fileData.length
		if (ifFileSizeExceeded(fileSize)) {
			const startIndex = fileData.indexOf('\n', fileSize - LOGFILE_MAX_SIZE)
			fs.writeFileSync(filePath, fileData.substring(startIndex + 1), 'utf8')
			cons.log(`File '${filePath}' has been truncated`)
		}
	}
}, LOGFILE_TRUNCATE_INTERVAL)
