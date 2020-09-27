"use strict"

import { arch } from 'os'
import { resolve } from 'path'
import { EventEmitter } from 'events'
import Process from './Process'

class Client extends EventEmitter {
	constructor(appPath) {
		super()
		this.appPath = appPath
		this.bin = this.getBin(arch())
		this.loggedIn = false
		this.processes = new Map()
		this.activeBuild = new Map()
		this.getVersion()
		this.checkLogin()
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
		let binPath = resolve(this.appPath, '..', 'src', 'sdk', 'itch', 'bin')
		switch(arch) {
			case 'x64':
				return resolve(binPath, 'butler-win64.exe')
			case 'x32':
				return resolve(binPath, 'butler-win32.exe')
			default: return null
		}
	}

	getVersion() {
		return new Promise((resolve, reject)=>{
			let version = ""
			let regex = /^v(?<version>\d{1,3}\.\d{1,3}\.\d{1,3}), built on (?<date>.*?), ref (?<ref>.*?)\n/
			let cmd = this.runCommand('version')
			cmd.on('process-data', data => {
				version += data
			})
			cmd.on('process-close', _ => {
				let versionObj = version.match(regex)
				this.version = versionObj.groups.version
				this.versionDate = versionObj.groups.date
				this.versionRef = versionObj.groups.ref
				this.emit('version', this.version)
				resolve(versionObj.groups)
			})
		});
	}

	checkLogin() {
		this.login()
	}

	logout() {
		return new Promise((resolve, reject)=>{
			let cmd = this.runCommand('logout')
			cmd.on('process-data', data => {
				let invalidate = data.toString().match(/:: Do you want to erase your saved API key\? \[y\/N\]/)
				if (invalidate) {
					cmd.write('y')
				}

				let loggedOut = data.toString().match(/(You've successfully erased the API key that was saved on your computer\.|No saved credentials at .*)/)
				if (loggedOut) {
					this.loggedIn = false
					this.emit('logout')
					resolve(true)
				}
			})
		});
	}

	login() {
		return new Promise((resolve, reject)=>{
			let cmd = this.runCommand('login')
			cmd.on('process-data', data => {
				let sdata = data.toString()

				let loggedIn = sdata.match(/(Authenticated successfully!|Your local credentials are valid!)/)
				if (loggedIn) {
					this.loggedIn = true
					this.emit('login')
					resolve(true)
				}
			})
		})
	}

	push(directory, gameId, arches) {
		return new Promise((resolve, reject)=>{
			if (this.activeBuild.get(gameId)) {
				return reject('Already building')
			}

			this.activeBuild.set(gameId, { gameId })
			let channel = arches.join("-")
			let cmd = this.runCommand('push', directory, `${gameId}:${channel}`)
			cmd.on('process-data', data => {
				let sdata = data.toString()

				let pushing = sdata.match(/∙ Pushing/)
				if (pushing) {
					this.activeBuild.set(gameId, { gameId })
					this.emit('build-pushing', this.activeBuild.get(gameId))
				}

				let progress = sdata.match(/ (?<percent>\d{1,3}\.\d\d)%/)
				if (progress) {
					this.activeBuild.set(gameId, { gameId, percent: progress.groups.percent })
					this.emit('build-progress', this.activeBuild.get(gameId))
				}

				let uploaded = sdata.match(/∙ Build is now processing, should be up in a bit\./)
				if (uploaded) {
					this.activeBuild.set(gameId, { gameId })
					this.emit('build-uploaded', this.activeBuild.get(gameId))
				}
			})

			cmd.on('process-close', _ => {
				this.activeBuild.delete(gameId)
			})
		})
	}
}

export default Client