"use strict"

import { arch, homedir } from 'os'
import { unlink, existsSync } from 'fs'
import { resolve, sep } from 'path'
import { EventEmitter } from 'events'
import Process from './Process'
import Application from './Application'

class Client extends EventEmitter {
	constructor() {
		super()
		this.bin = this.getBin(arch())
		this.loggedIn = false
		this.credFile = [...homedir().split(sep), '.dispatch', 'credentials.json'].join(sep)
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
		let binPath = resolve(__dirname, '..', 'public', 'sdk', 'discord', 'bin')
		console.log(`Setting SteamCmd bin path to ${binPath}`)
		switch(arch) {
			case 'x64':
				return resolve(binPath, 'dispatch-win64.exe')
			case 'x32':
				return resolve(binPath, 'dispatch-win32.exe')
			default: return null
		}
	}

	getVersion() {
		return new Promise((resolve, reject)=>{
			let version = ""
			let regex = /^(?<executable>dispatch-[\w\.]+) (?<version>\d{1,3}\.\d{1,3}\.\d{1,3})-(?<branch>rc\d+)-(?<ref>\w+)/
			let cmd = this.runCommand('--version')
			cmd.on('process-data', data => {
				version += data
			})
			cmd.on('process-close', _ => {
				let versionObj = version.match(regex)
				if (!versionObj) return reject('No version found')

				this.version = versionObj.groups.version
				this.emit('version', this.version)
				resolve(versionObj.groups)
			})
		});
	}

	checkLogin() {
		this.loggedIn = existsSync(this.credFile)
	}

	logout() {
		return new Promise(async (resolve, reject)=>{
			unlink(this.credFile, err => {
				if (err) return reject(`Failed to logout: ${err}`)
				this.loggedIn = false
				return resolve(true)
			})
		});
	}

	login() {
		return new Promise((resolve, reject)=>{
			let cmd = this.runCommand('login')
			cmd.on('process-data', data => {
				let sdata = data.toString()
				console.log(sdata)

				let loggedIn = sdata.match(/(Saving credentials file|Already logged in)/)
				if (loggedIn) {
					this.loggedIn = true
					this.emit('login')
					resolve(true)
				}
			})
		})
	}

	getMasterBranchId(gameId) {
		return new Promise((resolve, reject) => {
			let app = new Application(gameId, this.bin)
			app.on('access-failed', _ => {
				this.logout()
				resolve(false)
			})
			app.on('branches-ready', _ => {
				let masterBranch = app.getBranchByName('master');
				if (masterBranch) {
					// create master branch
					return resolve(masterBranch.id)
				} else {
					return reject('No master branch')
				}
			})
		})
	}

	push(directory, gameId, configFile) {
		return new Promise(async (resolve, reject) => {
			if (this.activeBuild.get(gameId)) {
				return reject('Already building')
			}

			console.log(`BUIDLING ${ gameId } FOR DISCORD`)
			this.activeBuild.set(gameId, { gameId })

			let masterBranchId = await this.getMasterBranchId(gameId).catch(console.error)
			if (!masterBranchId) {
				this.activeBuild.delete(gameId)
				return reject('No master branch')
			}

			this.activeBuild.set(gameId, { gameId })
			this.emit('build-pushing', this.activeBuild.get(gameId))
			let cmd = this.runCommand('build', 'push', masterBranchId, configFile, directory)
			
			// dispatch uses stderr for some reason
			cmd.on('process-error', data => {
				let sdata = data.toString()
				
				let progress = sdata.match(/\[(?<currentTask>\d+)\/(?<totalTasks>\d+)\]/)
				if (progress) {
					let percent = (Number(progress.groups.currentTask) / Number(progress.groups.totalTasks)) * 100
					this.activeBuild.set(gameId, { gameId, percent })
					this.emit('build-progress', this.activeBuild.get(gameId))
				}

				let build = sdata.match(/Build ID:\s(?<buildId>\d+)/)
				if (build) {
					this.runCommand('build', 'publish', gameId, masterBranchId, build.groups.buildId)
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