"use strict"

import Process from './Process'
import { EventEmitter } from 'events'

class Application extends EventEmitter {
	constructor(appId, bin) {
		super()
		this.id = appId
		this.bin = bin
		this.appInfo = null
		this.branches = new Map()
		this.getAppInfo()
	}

	getAppInfo() {
		let appSpawn = new Process(this.bin, ["branch", "list", this.id])
		appSpawn.on('process-data', data => {
			let sdata = data.toString()

			let accessFailed = sdata.match(/Failed to get access token/)
			if (accessFailed) {
				this.emit('access-failed')
			}

			// if table, get branch list
			let table = sdata.match(/APPLICATION ID/)
			if (table) {
				this.appInfo = this.parseTable(sdata)
				this.emit('branches-ready')
			}
		})
	}

	getBranchByName(name) {
		let branch = null
		this.branches.forEach(b => {
			if (b.name === name) branch = b
		})
		return branch
	}

	parseTable(string) {
		let entryArray = string.split('\n').slice(2)
		let entryRegex = /\|\s+(?<appId>\d+)\s+\|\s+(?<id>\d+)\s+\|\s+(?<name>\w+)\s+\|\s+(?<liveBuild>\d+)\s+\|\s+(?<createdAt>.*?)\s+\|/i
		for (let entry of entryArray) {
			let branchMatch = entry.match(entryRegex)
			if (branchMatch) {
				let branch = branchMatch.groups
				this.branches.set(branch.id, branch)
			}
		}
	}
}

export default Application