// Simple Logger
// Version: 1.5.0
// Author: Max Shane <wellloy1@gmail.com>

const fs = require("fs").promises;
const consoleFmt = require('./console.js')

function getISOstring(date) {
	return new Date(date.getTime() + date.getTimezoneOffset()).toISOString().split('.')[0].replace('T', '_')
}

function getEmptyString(date) {
	return ''
}

function messageSerialize(message) {
	const types = {
		'object': () => JSON.stringify(message, null, '\t'),
		'array': () => JSON.stringify(message, null, '\t'),
		'function': () => message.toString(),
		'boolean': () => message.toString(),
		'bigint': () => message.toString(),
		'symbol': () => message.toString(),
		'undefined': () => message + '',
		'null': () => message + '',
	}

	return typeof message !== "string"
		? typeof message !== "number"
			? types[typeof message]()
			: message.toString()
		: message;
}

function checkBool (bit) {
	if (bit === '1') return true
	if (bit === '0') return false
	return bit
}

class Logger {
	#streams = {};
	#options = null;
	#state = { launched: false };
	#defaulStreamName = 'main'
	#defaulType = 'log'
	#getTime = getISOstring

	getFileSize(streamName = this.#defaulStreamName) {
		return this.#streams[streamName].file.stat().size
	}

	constructor(options) {
		this.#options = options;
	}

	async launch() {
		if (this.#state.launched === true) {
			console.log("Cannot launch. It has already been launched!");
		} else {
			if (this.#options.time === false) this.#getTime = getEmptyString;
			const streams = this.#options.streams;
			for (let streamName in streams) {
				this.#streams[streamName] = {};
				for (let key in streams[streamName]) {
					if (key === 'file') {
						this.#streams[streamName].file = await fs.open(
							streams[streamName].file,
							"a+",
							0o777
						);
						continue
					}
					this.#streams[streamName][key] = streams[streamName][key]
				}
			}
			this.#state.launched = true;
		}
	}

	stop() {
		for (let streamName in this.#options.streams) {
			this.#streams[streamName].close();
			delete this.#streams[streamName];
		}
	}

	#write(type, message, data) {			
		const timeString = this.#getTime(new Date)
		const streamName = this.#defaulStreamName

		if (arguments.length === 2) {
			if (this.#options.stdout === true && this.#streams[streamName].stdout === true)	consoleFmt(type, timeString, message)
			if (this.#options.write === true && this.#streams[streamName].write === true) {
				this.#streams[streamName].file.writeFile(
					timeString + ' [' + type + '] ' +
					messageSerialize(message) +
					"\n\n",
					"utf8"
				);
			}						
		}

		if (arguments.length === 3) {
			if (message !== null) {
				messageSerialize(message)
			}
			if (this.#options.stdout === true && this.#streams[streamName].stdout === true)	consoleFmt(type, timeString, message, data)		
			if (this.#options.write === true && this.#streams[streamName].write === true) {	
				if (typeof data !== 'string') data = messageSerialize(data)
				this.#streams[streamName].file.writeFile(
					timeString + ' [' + type + '] ' +
					message + ' ' + data +
					"\n\n",
					"utf8"
				);	
			}		
		}		
	}	

	log(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("log", message) 	
		}
		if (arguments.length === 2) this.#write("log", message, data) 	
	}
	
	info(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("info", message) 	
		}
		if (arguments.length === 2) this.#write("info", message, data) 	
	}

	error(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("error", message) 	
		}
		if (arguments.length === 2) this.#write("error", message, data) 	
	}

	fatal(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("fatal", message) 	
		}
		if (arguments.length === 2) this.#write("fatal", message, data) 	
	}

	warn(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("warn", message) 	
		}
		if (arguments.length === 2) this.#write("warn", message, data) 	
	}
	
	debug(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("debug", message) 	
		}
		if (arguments.length === 2) this.#write("debug", message, data) 	
	}

	trace(message, data) {	
		if (arguments.length < 1) throw Error('Requires at least 1 argument')
		if (arguments.length === 1) {
			this.#write("trace", message) 	
		}
		if (arguments.length === 2) this.#write("trace", message, data) 	
	}

	setTime(bit) {		
		const bool = checkBool(bit)
		if (typeof bool === 'boolean') {
			this.#options.time = bool 
			return { result: 'OK' }
		} else {
			return { result: 'FAILED', reason: 'Argument must be between 0 and 1' }
		}	

	}
	setWrite(bit) {
		const bool = checkBool(bit)
		if (typeof bool === 'boolean') {
			this.#options.write = bool 
			return { result: 'OK' }
		} else {
			return { result: 'FAILED', reason: 'Argument must be between 0 and 1' }
		}	
	}
	setStdout(bit) {
		const bool = checkBool(bit)
		if (typeof bool === 'boolean') {
			this.#options.stdout = bool 
			return { result: 'OK' }
		} else {
			return { result: 'FAILED', reason: 'Argument must be between 0 and 1' }
		}	
	}
	setKeepDays(uint) {
		uint = Number(uint)
		if (uint >= 1 && uint <= 365 * 3) {
			uint = Math.round(uint)
			this.#options.keepDays = uint 
			return { result: 'OK' }
		} else {
			return { result: 'FAILED', reason: 'Argument must be a "Uint" between 1 and 365' }
		}		
	}

	getOptions() {
		return { 
			time: this.#options.time, 
			write: this.#options.write, 
			stdout: this.#options.stdout, 
			keepDays: this.#options.keepDays, 
		}
	}
}

module.exports = Logger;

