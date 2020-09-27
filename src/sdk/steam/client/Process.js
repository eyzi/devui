"use strict"

import { spawn } from 'child_process'
import { EventEmitter } from 'events'
import uuid from 'uuid/v4'

class Process extends EventEmitter {
	constructor(bin, args) {
		super()

		this.id = uuid()
		this.process = spawn(bin, args)

		this.process.stdout.on('data', data => {
			this.emit('process-data', data)
		})
		this.process.stderr.on('data', data => {
			this.emit('process-error', data)
		})
		this.process.on('close', code => {
			this.emit('process-close', code)
		})
	}

	write(command) {
		this.process.stdin.write(`${command}\r\n`)
	}

	kill(code) {
		this.process.kill(code)
	}
}

export default Process