"use strict"

import { arch } from 'os'
import { resolve } from 'path'
import { EventEmitter } from 'events'
import Process from './Process'

class Client extends EventEmitter {
	constructor() {
		super()
		this.bin = this.getBin(arch())
		this.processes = new Map()
		this.activeBuild = new Map()
	}

	runCommand(...args) {
		if (!this.bin) return;
		let process = new Process(this.bin, args)
		this.emit('process-start', process.id)
		process.on('process-close', _ => {
			this.processes.delete(process.id)
			this.emit('process-end', process.id)
		})
		this.processes.set(process.id, process)
		return process
	}

	getBin(arch) {
		let binPath = resolve(__dirname, '..', 'public', 'sdk', 'steam', 'bin')
		console.log(`Setting SteamCmd bin path to ${binPath}`)
		switch (arch) {
			default: return resolve(binPath, 'steamcmd.exe')
		}
	}

	push(gameId, username, password, code, buildFile) {
		if (this.activeBuild.get(gameId)) {
			return reject('Already building')
		}

		console.log(`BUIDLING ${ gameId } FOR STEAM`)
		this.activeBuild.set(gameId, { gameId, percent: 20 })
		this.emit('build-pushing', this.activeBuild.get(gameId))

		let cmd = this.runCommand(`+login ${username} ${password} ${code}`, `+run_app_build "${buildFile}"`, '+quit')
		cmd.on('process-data', data => {
			let sdata = data.toString()
			this.activeBuild.set(gameId, { gameId, percent: 50 })
			this.emit('build-progress', this.activeBuild.get(gameId))
		})
		cmd.on('process-close', _ => {
			this.activeBuild.set(gameId, { gameId, percent: 100 })
			this.emit('build-uploaded', this.activeBuild.get(gameId))
			this.activeBuild.delete(gameId)
		})
	}
}

export default Client